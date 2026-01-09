package com.jobportal.controller;

import com.jobportal.entity.CV;
import com.jobportal.service.CVService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cv")
@CrossOrigin(origins = {"http://localhost:3000", "https://novalianajob.netlify.app"})
public class CVController {
    @Autowired
    private CVService cvService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadCV(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            CV cv = cvService.uploadCV(file, userEmail);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "CV uploaded successfully");
            response.put("cv", Map.of(
                    "id", cv.getId(),
                    "fileName", cv.getFileName(),
                    "uploadedAt", cv.getUploadedAt()
            ));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IOException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<CV>> getUserCVs(Authentication authentication) {
        String userEmail = authentication.getName();
        List<CV> cvs = cvService.getUserCVs(userEmail);
        return ResponseEntity.ok(cvs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CV> getCVById(@PathVariable Long id, Authentication authentication) {
        String userEmail = authentication.getName();
        CV cv = cvService.getCVById(id, userEmail);
        return ResponseEntity.ok(cv);
    }
}

