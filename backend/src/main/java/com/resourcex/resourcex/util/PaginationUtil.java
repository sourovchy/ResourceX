package com.resourcex.resourcex.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PaginationUtil {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 100;
    private static final String DEFAULT_SORT_FIELD = "createdAt";

    private PaginationUtil() {
    }

    public static Pageable createPageable(
            int page,
            int size,
            String sortBy
    ) {

        if (page < 0) {
            page = DEFAULT_PAGE;
        }

        if (size <= 0) {
            size = DEFAULT_SIZE;
        }

        if (size > MAX_PAGE_SIZE) {
            size = MAX_PAGE_SIZE;
        }

        if (sortBy == null || sortBy.isBlank()) {
            sortBy = DEFAULT_SORT_FIELD;
        }

        return PageRequest.of(
                page,
                size,
                Sort.by(sortBy.trim()).descending()
        );
    }
}