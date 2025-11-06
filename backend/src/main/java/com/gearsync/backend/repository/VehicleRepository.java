package com.gearsync.backend.repository;
import com.gearsync.backend.model.User;
import com.gearsync.backend.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByOwner(User owner);
    boolean existsByRegistrationNumber(String registrationNumber);


    long countByOwner_Email(String email);

    List<Vehicle> findByOwnerId(Long ownerId);

}
