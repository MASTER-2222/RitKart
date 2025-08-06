package com.ritzone.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Order entity representing customer orders in RitZone
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {
    
    @Id
    private String id;
    
    @NotBlank(message = "Order number is required")
    @Indexed(unique = true)
    private String orderNumber;
    
    @NotBlank(message = "User ID is required")
    @Indexed
    private String userId;
    
    @NotEmpty(message = "Order items cannot be empty")
    private List<OrderItem> items;
    
    @NotNull(message = "Order status is required")
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;
    
    @NotNull(message = "Subtotal is required")
    @DecimalMin(value = "0.00", message = "Subtotal cannot be negative")
    private BigDecimal subtotal;
    
    @NotNull(message = "Tax amount is required")
    @DecimalMin(value = "0.00", message = "Tax amount cannot be negative")
    private BigDecimal taxAmount;
    
    @NotNull(message = "Shipping cost is required")
    @DecimalMin(value = "0.00", message = "Shipping cost cannot be negative")
    private BigDecimal shippingCost;
    
    @DecimalMin(value = "0.00", message = "Discount amount cannot be negative")
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.01", message = "Total amount must be greater than 0")
    private BigDecimal totalAmount;
    
    @NotNull(message = "Shipping address is required")
    private ShippingAddress shippingAddress;
    
    private BillingAddress billingAddress;
    
    @NotNull(message = "Payment information is required")
    private PaymentInfo paymentInfo;
    
    private ShippingInfo shippingInfo;
    
    private String notes;
    
    private String couponCode;
    
    @Builder.Default
    private Boolean isPrimeOrder = false;
    
    private LocalDateTime estimatedDeliveryDate;
    
    private LocalDateTime deliveredAt;
    
    private LocalDateTime cancelledAt;
    
    private String cancellationReason;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Enum for order status
    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PROCESSING,
        SHIPPED,
        OUT_FOR_DELIVERY,
        DELIVERED,
        CANCELLED,
        RETURNED,
        REFUNDED
    }
    
    // Nested class for order items
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productId;
        private String productTitle;
        private String productImage;
        private String productSku;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal totalPrice;
        private String productBrand;
        private String productCategory;
    }
    
    // Nested class for shipping address
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShippingAddress {
        private String fullName;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private String phoneNumber;
    }
    
    // Nested class for billing address
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BillingAddress {
        private String fullName;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private String phoneNumber;
    }
    
    // Nested class for payment information
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfo {
        private String paymentMethod; // CREDIT_CARD, DEBIT_CARD, PAYPAL, etc.
        private String paymentStatus; // PENDING, COMPLETED, FAILED, REFUNDED
        private String transactionId;
        private String stripePaymentIntentId;
        private LocalDateTime paymentDate;
        private BigDecimal paidAmount;
        private String cardLast4;
        private String cardBrand;
    }
    
    // Nested class for shipping information
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShippingInfo {
        private String carrier; // UPS, FedEx, USPS, etc.
        private String trackingNumber;
        private String shippingMethod; // STANDARD, EXPRESS, OVERNIGHT
        private LocalDateTime shippedDate;
        private LocalDateTime estimatedDelivery;
        private List<TrackingUpdate> trackingUpdates;
    }
    
    // Nested class for tracking updates
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrackingUpdate {
        private LocalDateTime timestamp;
        private String status;
        private String description;
        private String location;
    }
    
    // Helper methods
    public Integer getTotalItems() {
        return items != null ? items.stream().mapToInt(OrderItem::getQuantity).sum() : 0;
    }
    
    public Boolean isDelivered() {
        return status == OrderStatus.DELIVERED;
    }
    
    public Boolean isCancelled() {
        return status == OrderStatus.CANCELLED;
    }
    
    public Boolean canBeCancelled() {
        return status == OrderStatus.PENDING || status == OrderStatus.CONFIRMED;
    }
    
    public Boolean isShipped() {
        return status == OrderStatus.SHIPPED || status == OrderStatus.OUT_FOR_DELIVERY || status == OrderStatus.DELIVERED;
    }
}
