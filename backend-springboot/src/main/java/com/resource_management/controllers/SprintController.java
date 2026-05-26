package com.resource_management.controllers;

import com.resource_management.models.Sprint;
import com.resource_management.repositories.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
@CrossOrigin(origins = "*")
public class SprintController {

    @Autowired
    private SprintRepository sprintRepository;

    @GetMapping
    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    @PostMapping
    public Sprint createSprint(@RequestBody Sprint sprint) {
        return sprintRepository.save(sprint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable Long id, @RequestBody Sprint sprintDetails) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));

        sprint.setName(sprintDetails.getName());
        sprint.setStartDate(sprintDetails.getStartDate());
        sprint.setEndDate(sprintDetails.getEndDate());
        // Note: Re-assigning the parent Project is usually handled separately, but can be added here if needed.

        return ResponseEntity.ok(sprintRepository.save(sprint));
    }
}