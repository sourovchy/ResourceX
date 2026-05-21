package com.resourcex.resourcex.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class PaginationUtil {

    private PaginationUtil() {
    }

    public static Pageable createPageable(
            int page,
            int size,
            String sortBy
    ) {

        if (page < 0) {
            page = 0;
        }

        if (size <= 0) {
            size = 10;
        }

        return PageRequest.of(
                page,
                size,
                Sort.by(sortBy).descending()
        );
    }
}