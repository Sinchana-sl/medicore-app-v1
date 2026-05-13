package com.healthcare.modules.ai;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AiService {

    private static final String GROQ_URL      = "https://api.groq.com/openai/v1/chat/completions";
    private static final String VISION_MODEL  = "llama-3.2-11b-vision-preview";
    private static final String TEXT_MODEL    = "llama-3.3-70b-versatile";

    private final RestClient restClient;

    @Value("${groq.api-key}")
    private String apiKey;

    public AiService() {
        this.restClient = RestClient.builder().build();
    }

    @PostConstruct
    void validate() {
        if (isKeyMissing()) {
            log.warn("groq.api-key not configured — get a free key at console.groq.com");
        } else {
            log.info("Groq AI service ready (vision: {}, text: {})", VISION_MODEL, TEXT_MODEL);
        }
    }

    public String explainDocument(MultipartFile file, String language) {
        if (isKeyMissing()) {
            throw new IllegalStateException(
                "AI not configured. Get a free key at console.groq.com and set groq.api-key in application.yaml");
        }

        String contentType = file.getContentType();
        if (contentType == null) throw new IllegalArgumentException("Unknown file type");

        try {
            if (contentType.equals("application/pdf")) {
                return explainPdf(file, language);
            } else if (contentType.startsWith("image/")) {
                return explainImage(file, contentType, language);
            } else {
                throw new IllegalArgumentException(
                    "Unsupported file type. Please upload an image (JPG/PNG) or a PDF.");
            }
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Groq explanation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Could not analyse document: " + e.getMessage());
        }
    }

    // ── images via Llama vision ───────────────────────────────────────────────

    private String explainImage(MultipartFile file, String contentType, String language) throws Exception {
        String base64  = Base64.getEncoder().encodeToString(file.getBytes());
        String dataUrl = "data:" + contentType + ";base64," + base64;

        Map<String, Object> body = Map.of(
            "model", VISION_MODEL,
            "messages", List.of(Map.of("role", "user", "content", List.of(
                Map.of("type", "image_url", "image_url", Map.of("url", dataUrl)),
                Map.of("type", "text",      "text",      buildPrompt(language))
            ))),
            "max_tokens", 1500,
            "temperature", 0.3
        );

        return callGroq(body);
    }

    // ── PDFs: extract text with PDFBox, then send to Llama text model ─────────

    private String explainPdf(MultipartFile file, String language) throws Exception {
        String text;
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            text = new PDFTextStripper().getText(doc);
        }

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException(
                "Could not extract text from this PDF — it may be a scanned image. " +
                "Please convert it to a JPG/PNG and upload the image instead.");
        }

        String prompt = buildPrompt(language)
                + "\n\nDocument content:\n"
                + text.substring(0, Math.min(text.length(), 3500));

        Map<String, Object> body = Map.of(
            "model", TEXT_MODEL,
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "max_tokens", 1500,
            "temperature", 0.3
        );

        return callGroq(body);
    }

    // ── general health chat ───────────────────────────────────────────────────

    public String chat(List<Map<String, String>> history) {
        if (isKeyMissing()) {
            throw new IllegalStateException(
                "AI not configured. Get a free key at console.groq.com and set groq.api-key in application.yaml");
        }
        try {
            List<Map<String, String>> messages = new java.util.ArrayList<>();
            messages.add(Map.of("role", "system", "content", """
                    You are MediBot, a friendly and knowledgeable AI health assistant. \
                    You help patients with general health questions, explain medical terms, \
                    provide wellness tips, and guide them to seek professional care when needed.

                    Guidelines:
                    - Be warm, clear, and concise.
                    - Use bullet points or numbered lists when explaining multiple items.
                    - For serious symptoms (chest pain, difficulty breathing, stroke signs), \
                      always advise seeking emergency care immediately.
                    - Never diagnose a condition or prescribe medication — only explain and guide.
                    - If a question is unrelated to health/medicine, politely redirect to health topics.
                    """));
            messages.addAll(history);

            Map<String, Object> body = Map.of(
                "model", TEXT_MODEL,
                "messages", messages,
                "max_tokens", 1024,
                "temperature", 0.6
            );
            return callGroq(body);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("Groq chat failed: {}", e.getMessage(), e);
            throw new RuntimeException("Chat error: " + e.getMessage());
        }
    }

    // ── shared HTTP call ──────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String callGroq(Map<String, Object> body) {
        Map<String, Object> response = restClient.post()
                .uri(GROQ_URL)
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null) throw new RuntimeException("Empty response from Groq");

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        if (choices == null || choices.isEmpty()) throw new RuntimeException("No choices in Groq response");

        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }

    // ── prompt ────────────────────────────────────────────────────────────────

    private String buildPrompt(String language) {
        return """
                You are a friendly medical assistant helping patients understand their medical documents.

                Analyse this medical document (prescription or lab report) and explain it in simple, \
                everyday language that a non-medical person can easily understand.

                Structure your response:
                1. **What this document is** – one-line description
                2. **Key findings / Medicines** – explain each item in plain terms \
                (if a medical term is needed, explain it in brackets)
                3. **What it means for you** – practical takeaway in 2-3 sentences
                4. **Things to remember** – dosage timings, precautions, or follow-up if mentioned

                IMPORTANT: Respond entirely in %s. Use simple, warm language as if explaining to a family member.
                Do NOT provide a diagnosis or medical advice — only explain what is written in the document.
                """.formatted(language);
    }

    private boolean isKeyMissing() {
        return apiKey == null || apiKey.isBlank() || apiKey.equals("YOUR_GROQ_API_KEY_HERE");
    }
}
