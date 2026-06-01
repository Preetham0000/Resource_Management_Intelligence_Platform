package com.resource_management.controllers;

import com.resource_management.models.Project;
import com.resource_management.models.Resource;
import com.resource_management.models.Sprint;
import com.resource_management.models.Task;
import com.resource_management.repositories.ProjectRepository;
import com.resource_management.repositories.ResourceRepository;
import com.resource_management.repositories.SprintRepository;
import com.resource_management.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/risk")
@CrossOrigin(origins = "*")
public class RiskController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    @GetMapping
    @Transactional
    public Map<String, Object> getRiskOverview() {
        List<Project> projects = projectRepository.findAll();
        List<Map<String, Object>> notifications = new ArrayList<>();
        List<Map<String, Object>> riskTable = new ArrayList<>();

        int delays = 0;
        for (Project project : projects) {
            Long projectId = project.getId();
            List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
            Sprint latestSprint = sprints.stream()
                    .filter(s -> s.getEndDate() != null)
                    .max(Comparator.comparing(Sprint::getEndDate))
                    .orElse(sprints.stream().max(Comparator.comparing(Sprint::getId)).orElse(null));

            List<Task> tasks = latestSprint != null ? taskRepository.findBySprintId(latestSprint.getId()) : Collections.emptyList();
            long completedTasks = tasks.stream()
                    .filter(t -> t.getStatus() != null && t.getStatus().equalsIgnoreCase("DONE"))
                    .count();
            int completionRate = tasks.isEmpty() ? 0 : (int) ((completedTasks * 100) / tasks.size());
            int velocity = (int) (completedTasks * 5);

            List<Resource> resources = resourceRepository.findByProjectId(projectId);
            int utilization = (int) resources.stream()
                    .filter(r -> r.getUtilization() != null)
                    .mapToInt(Resource::getUtilization)
                    .average()
                    .orElse(75.0);

            int daysRemaining = 0;
            if (latestSprint != null && latestSprint.getEndDate() != null) {
                daysRemaining = (int) Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), latestSprint.getEndDate()));
            }

            int riskScore = Math.min(100, completionRate > 0 ? (100 - completionRate) + utilization / 2 : 72);
            String status;
            if (riskScore >= 70) {
                status = "At Risk — Review Sprint Plan";
            } else if (riskScore >= 40) {
                status = "Moderate Risk — Monitor Closely";
            } else {
                status = "On Track — Maintain Pace";
            }

            if (latestSprint != null && latestSprint.getEndDate() != null && latestSprint.getEndDate().isBefore(LocalDate.now()) && completionRate < 90) {
                delays++;
            }

            riskTable.add(Map.of(
                    "name", project.getName(),
                    "vel", velocity,
                    "comp", completionRate,
                    "util", utilization,
                    "days", daysRemaining,
                    "risk", riskScore,
                    "status", status
            ));
        }

        if (delays > 0) {
            notifications.add(Map.of(
                    "type", "alert",
                    "icon", "⚠",
                    "title", delays + " project(s) behind schedule",
                    "time", "Just now"
            ));
        } else {
            notifications.add(Map.of(
                    "type", "info",
                    "icon", "ℹ",
                    "title", "All tracked projects are on schedule",
                    "time", "Just now"
            ));
        }

        return Map.of(
                "notifications", notifications,
                "riskTable", riskTable
        );
    }

    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> predictRisk(@RequestBody Map<String, Object> payload) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    mlServiceUrl + "/predict",
                    entity,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return ResponseEntity.ok(response.getBody());
            }
        } catch (Exception ignored) {
            // Fall through to rule-based fallback
        }

        return ResponseEntity.ok(evaluateRules(payload));
    }

    private Map<String, Object> evaluateRules(Map<String, Object> payload) {
        int velocity = toInt(payload.get("sprint_velocity"));
        int completion = toInt(payload.get("task_completion_rate"));
        int utilization = toInt(payload.get("team_utilization"));

        int delayProbability;
        String status;
        if (velocity >= 50 && completion >= 85 && utilization <= 85) {
            delayProbability = 12;
            status = "On Track — Maintain Pace";
        } else if ((velocity >= 30 && velocity < 50) || (completion >= 60 && completion < 85) || (utilization > 85 && utilization <= 95)) {
            delayProbability = 48;
            status = "Moderate Risk — Monitor Closely";
        } else {
            delayProbability = 82;
            status = "At Risk — Review Sprint Plan";
        }

        return Map.of(
                "delay_probability", delayProbability,
                "status", status
        );
    }

    private int toInt(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception ex) {
            return 0;
        }
    }
}
