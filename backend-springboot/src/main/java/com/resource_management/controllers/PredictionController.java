package com.resource_management.controllers;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.resource_management.models.Project;
import com.resource_management.models.Sprint;
import com.resource_management.models.Task;
import com.resource_management.models.Resource;
import com.resource_management.repositories.ProjectRepository;
import com.resource_management.repositories.SprintRepository;
import com.resource_management.repositories.TaskRepository;
import com.resource_management.repositories.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/predict")
@CrossOrigin(origins = "*")
public class PredictionController {

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @PostMapping("/{projectId}")
    public ResponseEntity<PredictionResponse> predictDelay(@PathVariable Long projectId, @RequestBody(required = false) PredictionRequest request) {
        // 1. Verify project exists
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // 2. Resolve metrics (either from request or calculate from DB)
        int sprintVelocity = 45;
        int taskCompletionRate = 70;
        int teamUtilization = 80;
        int daysRemaining = 7;

        boolean metricsCalculated = false;

        // If request is provided, try to extract values
        if (request != null) {
            if (request.getSprintVelocity() != null) {
                sprintVelocity = request.getSprintVelocity();
                metricsCalculated = true;
            }
            if (request.getTaskCompletionRate() != null) {
                taskCompletionRate = request.getTaskCompletionRate();
                metricsCalculated = true;
            }
            if (request.getTeamUtilization() != null) {
                teamUtilization = request.getTeamUtilization();
                metricsCalculated = true;
            }
            if (request.getDaysRemaining() != null) {
                daysRemaining = request.getDaysRemaining();
                metricsCalculated = true;
            }
        }

        // If metrics are not fully provided, let's calculate them dynamically from the database
        if (!metricsCalculated) {
            // Find Sprints for the Project
            List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
            if (!sprints.isEmpty()) {
                // Get the latest sprint (based on ID or end date)
                Sprint latestSprint = sprints.stream()
                        .max(Comparator.comparing(Sprint::getId))
                        .orElse(sprints.get(sprints.size() - 1));

                // Find Tasks for this Sprint
                List<Task> tasks = taskRepository.findBySprintId(latestSprint.getId());
                if (!tasks.isEmpty()) {
                    long totalTasks = tasks.size();
                    long completedTasks = tasks.stream()
                            .filter(t -> "DONE".equalsIgnoreCase(t.getStatus()))
                            .count();

                    // Calculate Sprint Velocity (assume 5 points per completed task)
                    sprintVelocity = (int) (completedTasks * 5);
                    // Calculate Task Completion Rate
                    taskCompletionRate = (int) ((completedTasks * 100) / totalTasks);
                }

                // Calculate Days Remaining
                if (latestSprint.getEndDate() != null) {
                    long daysBetween = ChronoUnit.DAYS.between(LocalDate.now(), latestSprint.getEndDate());
                    daysRemaining = daysBetween > 0 ? (int) daysBetween : 0;
                }
            }

            // Find Resources assigned to this Project
            List<Resource> resources = resourceRepository.findByProjectId(projectId);
            if (!resources.isEmpty()) {
                double avgUtilization = resources.stream()
                        .filter(r -> r.getUtilization() != null)
                        .mapToInt(Resource::getUtilization)
                        .average()
                        .orElse(80.0);
                teamUtilization = (int) avgUtilization;
            }
        }

        // 3. Attempt to call Python ML service
        try {
            RestTemplate restTemplate = new RestTemplate();
            String endpointUrl = mlServiceUrl + "/predict/" + projectId;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct payload matching Python service expectations
            Map<String, Object> payload = new HashMap<>();
            payload.put("sprint_velocity", sprintVelocity);
            payload.put("task_completion_rate", taskCompletionRate);
            payload.put("team_utilization", teamUtilization);
            payload.put("days_remaining", daysRemaining);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<PredictionResponse> responseEntity = restTemplate.postForEntity(
                    endpointUrl,
                    entity,
                    PredictionResponse.class
            );

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                return ResponseEntity.ok(responseEntity.getBody());
            }
        } catch (Exception exc) {
            // Log warning or system output
            System.err.println("WARNING: Python ML service invocation failed, falling back to rule-based analysis: " + exc.getMessage());
        }

        // 4. Fallback to Java rule-based analysis if Python ML service is down/unavailable
        PredictionResponse fallbackResponse = evaluateRules(sprintVelocity, taskCompletionRate, teamUtilization, projectId);
        return ResponseEntity.ok(fallbackResponse);
    }

    private PredictionResponse evaluateRules(int v, int c, int u, Long projectId) {
        int delayProbability;
        String status;

        if (v >= 50 && c >= 85 && u <= 85) {
            delayProbability = 12;
            status = "On Track — Maintain Pace";
        } else if ((v >= 30 && v < 50) || (c >= 60 && c < 85) || (u > 85 && u <= 95)) {
            delayProbability = 48;
            status = "Moderate Risk — Monitor Closely";
        } else {
            delayProbability = 82;
            status = "At Risk — Review Sprint Plan";
        }

        PredictionResponse response = new PredictionResponse();
        response.setDelayProbability(delayProbability);
        response.setStatus(status);
        response.setProjectId(projectId);
        return response;
    }

    // --- DTO Classes ---

    public static class PredictionRequest {
        @JsonProperty("sprint_velocity")
        private Integer sprintVelocity;

        @JsonProperty("task_completion_rate")
        private Integer taskCompletionRate;

        @JsonProperty("team_utilization")
        private Integer teamUtilization;

        @JsonProperty("days_remaining")
        private Integer daysRemaining;

        public Integer getSprintVelocity() {
            return sprintVelocity;
        }

        public void setSprintVelocity(Integer sprintVelocity) {
            this.sprintVelocity = sprintVelocity;
        }

        public Integer getTaskCompletionRate() {
            return taskCompletionRate;
        }

        public void setTaskCompletionRate(Integer taskCompletionRate) {
            this.taskCompletionRate = taskCompletionRate;
        }

        public Integer getTeamUtilization() {
            return teamUtilization;
        }

        public void setTeamUtilization(Integer teamUtilization) {
            this.teamUtilization = teamUtilization;
        }

        public Integer getDaysRemaining() {
            return daysRemaining;
        }

        public void setDaysRemaining(Integer daysRemaining) {
            this.daysRemaining = daysRemaining;
        }
    }

    public static class PredictionResponse {
        @JsonProperty("delay_probability")
        private Integer delayProbability;

        private String status;

        @JsonProperty("project_id")
        private Long projectId;

        public Integer getDelayProbability() {
            return delayProbability;
        }

        public void setDelayProbability(Integer delayProbability) {
            this.delayProbability = delayProbability;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Long getProjectId() {
            return projectId;
        }

        public void setProjectId(Long projectId) {
            this.projectId = projectId;
        }
    }
}
