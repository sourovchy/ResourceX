package com.thirdhand.campusvault.repository;

import com.thirdhand.campusvault.entity.Item;
import com.thirdhand.campusvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByOwner(User owner);

    List<Item> findByApprovedTrue();
}