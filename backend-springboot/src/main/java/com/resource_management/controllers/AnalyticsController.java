package com.resource_management.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/at-risk-projects")
    public ResponseEntity<Object> getAtRiskProjects() {
        String url = mlServiceUrl + "/analytics/at-risk-projects";
        return restTemplate.getForEntity(url, Object.class);
    }

    @GetMapping("/sprint-velocity")
    public ResponseEntity<Object> getSprintVelocity(@RequestParam(required = false, name = "project_id") Long projectId) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(mlServiceUrl + "/analytics/sprint-velocity");
        if (projectId != null) {
            builder.queryParam("project_id", projectId);
        }
        return restTemplate.getForEntity(builder.toUriString(), Object.class);
    }
}
