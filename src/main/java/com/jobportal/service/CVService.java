package com.jobportal.service;

import com.jobportal.entity.CV;
import com.jobportal.entity.User;
import com.jobportal.repository.CVRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class CVService {
    @Autowired
    private CVRepository cvRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Value("${file.upload-dir:uploads/cv}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    private static final List<String> ALLOWED_EXTENSIONS = List.of("pdf", "doc", "docx");

    @Transactional
    public CV uploadCV(MultipartFile file, String userEmail) throws IOException {
        // Validate file
        validateFile(file);

        // Get user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFileName = UUID.randomUUID().toString() + "." + fileExtension;
        Path filePath = uploadPath.resolve(uniqueFileName);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create CV entity
        CV cv = new CV();
        cv.setUser(user);
        cv.setFileName(originalFilename);
        cv.setFilePath(filePath.toString());
        cv.setFileSize(file.getSize());

        // Save CV metadata
        CV savedCV = cvRepository.save(cv);

        // Send email notification
        try {
            emailService.sendCVUploadEmail(user.getName(), user.getEmail(), originalFilename);
        } catch (Exception e) {
            // Log error but don't fail upload
            System.err.println("Failed to send CV upload email: " + e.getMessage());
        }

        return savedCV;
    }

    public List<CV> getUserCVs(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return cvRepository.findByUser(user);
    }

    public CV getCVById(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return cvRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("CV not found"));
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds 2MB limit");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("Invalid file name");
        }

        String fileExtension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            throw new RuntimeException("Only PDF, DOC, and DOCX files are allowed");
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            throw new RuntimeException("File must have an extension");
        }
        return filename.substring(lastDotIndex + 1);
    }
}

