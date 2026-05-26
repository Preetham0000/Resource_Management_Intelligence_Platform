package com.resource_management.controllers;

import com.resource_management.models.Project;
import com.resource_management.repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @PostMapping
    public Project createProject(@RequestBody Project project) {
        return projectRepository.save(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project projectDetails) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        project.setName(projectDetails.getName());
        project.setDescription(projectDetails.getDescription());
        project.setStartDate(projectDetails.getStartDate());
        project.setEndDate(projectDetails.getEndDate());

        return ResponseEntity.ok(projectRepository.save(project));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}