package com.healthcare.modules.doctor.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ConsultationTypeEntry {

    @NotBlank
    @Pattern(regexp = "IN_PERSON|AUDIO|VIDEO", message = "type must be IN_PERSON, AUDIO, or VIDEO")
    private String type;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal fee;
}
