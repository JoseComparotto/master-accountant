export interface ApiErrorResponseDto {
    statusCode: number;
    path: string;
    error: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
}