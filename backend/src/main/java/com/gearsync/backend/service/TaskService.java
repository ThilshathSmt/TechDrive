package com.gearsync.backend.service;

import com.gearsync.backend.dto.ServiceDTO;
import com.gearsync.backend.dto.ServiceResponseDTO;
import com.gearsync.backend.exception.DuplicateResourceException;
import com.gearsync.backend.model.Services;
import com.gearsync.backend.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final ServiceRepository serviceRepository;

    @Transactional
    public void newServiceAdd(ServiceDTO serviceDTO) {
        if (serviceRepository.existsByServiceName(serviceDTO.getServiceName())) {
            throw new DuplicateResourceException("Service name already exists: "+ serviceDTO.getServiceName());
        }
        Services services = new Services();

        services.setServiceName(serviceDTO.getServiceName());
        services.setDescription(serviceDTO.getDescription());
        services.setBasePrice(serviceDTO.getBasePrice());
        services.setEstimatedDurationMinutes(serviceDTO.getEstimatedDurationMinutes());
        services.setCategory(serviceDTO.getCategory());

        serviceRepository.save(services);
    }

    @Transactional(readOnly = true)
    public List<ServiceResponseDTO> getAllServiceDetails() {
        return serviceRepository
                .findAll(Sort.by(Sort.Direction.ASC, "serviceName"))
                .stream()
                .map(service -> new ServiceResponseDTO(
                        service.getId(),
                        service.getServiceName(),
                        service.getDescription(),
                        service.getBasePrice(),
                        service.getEstimatedDurationMinutes(),
                        service.getCategory()
                ))
                .toList();
    }
}
