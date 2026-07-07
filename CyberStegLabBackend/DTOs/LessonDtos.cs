namespace CyberStegLab.API.DTOs;

public record CreateLessonRequest(
    string Title,
    string Content,
    string Badge,
    int Order
);

public record UpdateLessonRequest(
    string Title,
    string Content,
    string Badge,
    int Order
);