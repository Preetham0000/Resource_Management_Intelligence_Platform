package com.resource_management.controllers;

import com.resource_management.models.Resource;
import com.resource_management.repositories.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    @Autowired
    private ResourceRepository resourceRepository;

    @GetMapping
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @PostMapping
    public Resource createResource(@RequestBody Resource resource) {
        return resourceRepository.save(resource);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @RequestBody Resource resourceDetails) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        resource.setName(resourceDetails.getName());
        resource.setRole(resourceDetails.getRole());
        resource.setAvailability(resourceDetails.getAvailability());
        resource.setUtilization(resourceDetails.getUtilization());
        resource.setProjectId(resourceDetails.getProjectId());

        return ResponseEntity.ok(resourceRepository.save(resource));
    }
}
