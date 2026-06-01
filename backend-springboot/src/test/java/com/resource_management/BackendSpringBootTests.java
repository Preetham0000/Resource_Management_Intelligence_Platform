package com.resource_management;

import com.resource_management.controllers.*;
import com.resource_management.models.*;
import com.resource_management.repositories.*;
import com.resource_management.security.JwtTokenProvider;
import com.resource_management.dtos.LoginRequest;
import com.resource_management.dtos.SignupRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BackendSpringBootTests {

    // --- Mocks for AuthController ---
    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider tokenProvider;
    @InjectMocks private AuthController authController;

    // --- Mocks for ProjectController ---
    @Mock private ProjectRepository projectRepository;
    @InjectMocks private ProjectController projectController;

    // --- Mocks for SprintController ---
    @Mock private SprintRepository sprintRepository;
    @InjectMocks private SprintController sprintController;

    // --- Mocks for TaskController ---
    @Mock private TaskRepository taskRepository;
    @InjectMocks private TaskController taskController;

    // --- Mocks for ResourceController ---
    @Mock private ResourceRepository resourceRepository;
    @InjectMocks private ResourceController resourceController;

    // --- Mocks for PredictionController ---
    @InjectMocks private PredictionController predictionController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // ==================== AUTH CONTROLLER TESTS ====================

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("password");

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mocked-jwt-token");

        ResponseEntity<?> response = authController.authenticateUser(request);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("mocked-jwt-token", response.getBody());
    }

    @Test
    void testRegister_Success() {
        SignupRequest request = new SignupRequest();
        request.setUsername("newuser");
        request.setPassword("password");
        request.setRole("ROLE_DEV");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded-password");

        ResponseEntity<?> response = authController.registerUser(request);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("User registered successfully!", response.getBody());

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegister_UsernameTaken() {
        SignupRequest request = new SignupRequest();
        request.setUsername("existinguser");
        request.setPassword("password");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        ResponseEntity<?> response = authController.registerUser(request);
        assertEquals(400, response.getStatusCode().value());
        assertEquals("Error: Username is already taken!", response.getBody());
    }

    // ==================== PROJECT CONTROLLER TESTS ====================

    @Test
    void testGetAllProjects() {
        Project p1 = new Project();
        p1.setId(1L);
        p1.setName("Project 1");

        Project p2 = new Project();
        p2.setId(2L);
        p2.setName("Project 2");

        when(projectRepository.findAll()).thenReturn(Arrays.asList(p1, p2));

        List<Project> result = projectController.getAllProjects();
        assertEquals(2, result.size());
        assertEquals("Project 1", result.get(0).getName());
    }

    @Test
    void testCreateProject() {
        Project p = new Project();
        p.setName("New Project");

        when(projectRepository.save(p)).thenReturn(p);

        Project result = projectController.createProject(p);
        assertNotNull(result);
        assertEquals("New Project", result.getName());
    }

    @Test
    void testUpdateProject_Success() {
        Project existing = new Project();
        existing.setId(1L);
        existing.setName("Old Name");

        Project details = new Project();
        details.setName("New Name");

        when(projectRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(projectRepository.save(any(Project.class))).thenAnswer(i -> i.getArguments()[0]);

        ResponseEntity<Project> response = projectController.updateProject(1L, details);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("New Name", response.getBody().getName());
    }

    @Test
    void testDeleteProject() {
        doNothing().when(projectRepository).deleteById(1L);
        ResponseEntity<?> response = projectController.deleteProject(1L);
        assertEquals(200, response.getStatusCode().value());
        verify(projectRepository, times(1)).deleteById(1L);
    }

    // ==================== SPRINT CONTROLLER TESTS ====================

    @Test
    void testGetAllSprints() {
        Sprint s = new Sprint();
        s.setId(1L);
        s.setName("Sprint 1");

        when(sprintRepository.findAll()).thenReturn(Collections.singletonList(s));

        List<Sprint> result = sprintController.getAllSprints();
        assertEquals(1, result.size());
        assertEquals("Sprint 1", result.get(0).getName());
    }

    @Test
    void testCreateSprint() {
        Sprint s = new Sprint();
        s.setName("Sprint Alpha");

        when(sprintRepository.save(s)).thenReturn(s);

        Sprint result = sprintController.createSprint(s);
        assertEquals("Sprint Alpha", result.getName());
    }

    @Test
    void testUpdateSprint_Success() {
        Sprint existing = new Sprint();
        existing.setId(1L);
        existing.setName("Sprint Old");

        Sprint details = new Sprint();
        details.setName("Sprint New");

        when(sprintRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(sprintRepository.save(any(Sprint.class))).thenAnswer(i -> i.getArguments()[0]);

        ResponseEntity<Sprint> response = sprintController.updateSprint(1L, details);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Sprint New", response.getBody().getName());
    }

    // ==================== TASK CONTROLLER TESTS ====================

    @Test
    void testGetAllTasks() {
        Task t = new Task();
        t.setId(1L);
        t.setTitle("Task 1");

        when(taskRepository.findAll()).thenReturn(Collections.singletonList(t));

        List<Task> result = taskController.getAllTasks();
        assertEquals(1, result.size());
        assertEquals("Task 1", result.get(0).getTitle());
    }

    @Test
    void testCreateTask() {
        Task t = new Task();
        t.setTitle("Task New");

        when(taskRepository.save(t)).thenReturn(t);

        Task result = taskController.createTask(t);
        assertEquals("Task New", result.getTitle());
    }

    @Test
    void testUpdateTask_Success() {
        Task existing = new Task();
        existing.setId(1L);
        existing.setTitle("Task Old");

        Task details = new Task();
        details.setTitle("Task New");

        when(taskRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArguments()[0]);

        ResponseEntity<Task> response = taskController.updateTask(1L, details);
        assertEquals(200, response.getStatusCode().value());
        assertEquals("Task New", response.getBody().getTitle());
    }

    @Test
    void testDeleteTask() {
        doNothing().when(taskRepository).deleteById(1L);
        ResponseEntity<?> response = taskController.deleteTask(1L);
        assertEquals(200, response.getStatusCode().value());
        verify(taskRepository, times(1)).deleteById(1L);
    }

    // ==================== RESOURCE CONTROLLER TESTS ====================

    @Test
    void testGetAllResources() {
        Resource r = new Resource();
        r.setId(1L);
        r.setName("Resource 1");
        r.setRole("Developer");

        when(resourceRepository.findAll()).thenReturn(Collections.singletonList(r));

        List<Resource> result = resourceController.getAllResources();
        assertEquals(1, result.size());
        assertEquals("Resource 1", result.get(0).getName());
        assertEquals("Developer", result.get(0).getRole());
    }

    @Test
    void testCreateResource() {
        Resource r = new Resource("John Doe", "Manager", "Available", 50, 10L);

        when(resourceRepository.save(any(Resource.class))).thenReturn(r);

        Resource result = resourceController.createResource(r);
        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        assertEquals("Manager", result.getRole());
    }

    @Test
    void testUpdateResource_Success() {
        Resource existing = new Resource("John Doe", "Developer", "Available", 80, 10L);
        existing.setId(1L);

        Resource details = new Resource("John Updated", "Senior Developer", "Overloaded", 95, 10L);

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(i -> i.getArguments()[0]);

        ResponseEntity<Resource> response = resourceController.updateResource(1L, details);
        assertEquals(200, response.getStatusCode().value());
        Resource body = response.getBody();
        assertNotNull(body);
        assertEquals("John Updated", body.getName());
        assertEquals("Senior Developer", body.getRole());
        assertEquals("Overloaded", body.getAvailability());
        assertEquals(95, body.getUtilization());
    }

    // ==================== PREDICTION CONTROLLER TESTS ====================

    @Test
    void testPredictDelay_FallbackRuleBased() {
        Project proj = new Project();
        proj.setId(1L);
        proj.setName("Test Prediction Project");

        when(projectRepository.findById(1L)).thenReturn(Optional.of(proj));

        // Test with custom metrics payload
        PredictionController.PredictionRequest request = new PredictionController.PredictionRequest();
        request.setSprintVelocity(60);
        request.setTaskCompletionRate(90);
        request.setTeamUtilization(80);
        request.setDaysRemaining(5);

        ResponseEntity<PredictionController.PredictionResponse> response = predictionController.predictDelay(1L, request);
        assertEquals(200, response.getStatusCode().value());
        PredictionController.PredictionResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(12, body.getDelayProbability());
        assertEquals("On Track — Maintain Pace", body.getStatus());
        assertEquals(1L, body.getProjectId());
    }
}
