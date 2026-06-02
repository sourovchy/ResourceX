package com.resourcex.resourcex.dto;

import com.resourcex.resourcex.entity.FilePurpose;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    private Long fileId;
    private String originalName;
    private String storedName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private FilePurpose purpose;
}
