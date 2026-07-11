package com.resourcex.resourcex.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "files",
        indexes = {
                @Index(name = "idx_files_user_id", columnList = "user_id"),
                @Index(name = "idx_files_purpose", columnList = "purpose")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileId;

    /**
     * The user this file belongs to (the file's owner). For AVATAR / STUDENT_ID this
     * is the subject user; for ITEM_IMAGE it is the item's owner. Nullable only while a
     * STUDENT_ID upload is pending its registration link. User (1) → (N) File.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /** The item this file belongs to, when {@code purpose = ITEM_IMAGE}. Item (1) → (N) File. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    /**
     * Location of the file in storage. For locally-served uploads this is the
     * servable path ({@code /api/files/{name}}); for external storage it would
     * be the provider URL. Either way it is the single reference the app uses.
     */
    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FilePurpose purpose;
}
