package com.healthcare.modules.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiController {

    private final AiService aiService;

    @PostMapping(value = "/explain", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> explain(
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "English") String language
    ) {
        log.info("Document explanation requested: file={}, lang={}", file.getOriginalFilename(), language);
        String explanation = aiService.explainDocument(file, language);
        return ResponseEntity.ok(Map.of("explanation", explanation));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody List<Map<String, String>> history
    ) {
        String reply = aiService.chat(history);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
