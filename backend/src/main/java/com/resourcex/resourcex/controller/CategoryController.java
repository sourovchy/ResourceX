package com.resourcex.resourcex.controller;

import com.resourcex.resourcex.dto.response.CategoryResponse;
import com.resourcex.resourcex.entity.Category;
import com.resourcex.resourcex.exception.BadRequestException;
import com.resourcex.resourcex.exception.ResourceNotFoundException;
import com.resourcex.resourcex.repository.CategoryRepository;
import com.resourcex.resourcex.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    private final ItemRepository itemRepository;

    @GetMapping("")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CategoryResponse>> listCategories() {
        List<Category> cats = categoryRepository.findAll();

        // get counts from items grouped by category name
        List<Object[]> counts = itemRepository.getCategoryCounts();

        List<CategoryResponse> response = cats.stream().map(c -> {
            Long count = counts.stream()
                    .filter(o -> o[0] != null && c.getName().equalsIgnoreCase(o[0].toString()))
                    .map(o -> (Long) o[1])
                    .findFirst()
                    .orElse(0L);

            return CategoryResponse.builder()
                    .id(c.getCategoryId())
                    .name(c.getName())
                    .description(c.getDescription())
                    .itemCount(count)
                    .build();
        }).collect(Collectors.toList());

        // include any categories that exist as item.category but not in categories
        // table
        for (Object[] row : counts) {
            String name = row[0] != null ? row[0].toString() : null;
            Long cnt = (Long) row[1];
            boolean exists = response.stream().anyMatch(r -> r.getName() != null && r.getName().equalsIgnoreCase(name));
            if (!exists) {
                response.add(CategoryResponse.builder().id(null).name(name).description("").itemCount(cnt).build());
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody Category req) {
        if (req.getName() == null || req.getName().isBlank()) {
            throw new BadRequestException("Category name is required");
        }

        categoryRepository.findByNameIgnoreCase(req.getName().trim()).ifPresent(c -> {
            throw new BadRequestException("Category already exists");
        });

        Category saved = categoryRepository
                .save(Category.builder().name(req.getName().trim()).description(req.getDescription()).build());

        return ResponseEntity.ok(CategoryResponse.builder().id(saved.getCategoryId()).name(saved.getName())
                .description(saved.getDescription()).itemCount(0L).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id, @RequestBody Category req) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (req.getName() != null && !req.getName().isBlank())
            cat.setName(req.getName().trim());
        cat.setDescription(req.getDescription());

        Category saved = categoryRepository.save(cat);

        Long count = itemRepository.countByCategory_Name(saved.getName());

        return ResponseEntity.ok(CategoryResponse.builder().id(saved.getCategoryId()).name(saved.getName())
                .description(saved.getDescription()).itemCount(count).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR','SUPER_ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        long cnt = itemRepository.countByCategory_Name(cat.getName());
        if (cnt > 0) {
            throw new BadRequestException("Cannot delete category with active items");
        }

        categoryRepository.delete(cat);

        return ResponseEntity.ok().build();
    }
}
