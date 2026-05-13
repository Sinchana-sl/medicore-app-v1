package com.healthcare.modules.doctor.dto;

import com.healthcare.modules.clinic.NearbyClinicResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UnifiedSearchResponse {
    /** Doctors registered in MediCore whose clinic is within the search radius. */
    private List<PublicDoctorResponse> registeredDoctors;

    /** Real-time hospitals and clinics from OpenStreetMap within the search radius. */
    private List<NearbyClinicResponse> nearbyFacilities;
}
