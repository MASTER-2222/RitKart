package com.ritzone.service;

import com.ritzone.exception.ResourceNotFoundException;
import com.ritzone.model.Order;
import com.ritzone.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for order operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    
    private final OrderRepository orderRepository;
    
    /**
     * Get all orders with pagination
     */
    public Page<Order> getAllOrders(Pageable pageable, String status) {
        if (status != null && !status.isEmpty()) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            return orderRepository.findByStatus(orderStatus, pageable);
        }
        return orderRepository.findAll(pageable);
    }
    
    /**
     * Get order by ID
     */
    public Order getOrderById(String id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }
    
    /**
     * Get orders by user ID
     */
    public Page<Order> getOrdersByUserId(String userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable);
    }
    
    /**
     * Update order status
     */
    public Order updateOrderStatus(String id, String status, String trackingNumber) {
        Order order = getOrderById(id);

        Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        order.setStatus(orderStatus);

        if (trackingNumber != null && !trackingNumber.isEmpty() && order.getShippingInfo() != null) {
            order.getShippingInfo().setTrackingNumber(trackingNumber);
        }
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);
        log.info("Order status updated: {} - Status: {}", order.getOrderNumber(), status);

        return savedOrder;
    }
    
    /**
     * Get order statistics
     */
    public Map<String, Object> getOrderStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Total orders
        long totalOrders = orderRepository.count();
        stats.put("totalOrders", totalOrders);
        
        // Orders by status
        stats.put("pendingOrders", orderRepository.countByStatus(Order.OrderStatus.PENDING));
        stats.put("processingOrders", orderRepository.countByStatus(Order.OrderStatus.PROCESSING));
        stats.put("shippedOrders", orderRepository.countByStatus(Order.OrderStatus.SHIPPED));
        stats.put("deliveredOrders", orderRepository.countByStatus(Order.OrderStatus.DELIVERED));
        stats.put("cancelledOrders", orderRepository.countByStatus(Order.OrderStatus.CANCELLED));

        // Recent orders (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        LocalDateTime now = LocalDateTime.now();
        long recentOrders = orderRepository.countByDateRange(thirtyDaysAgo, now);
        stats.put("recentOrders", recentOrders);

        // Total revenue (calculate from delivered orders)
        List<Order> deliveredOrders = orderRepository.findByStatus(Order.OrderStatus.DELIVERED);
        double totalRevenue = deliveredOrders.stream()
            .mapToDouble(order -> order.getTotalAmount().doubleValue())
            .sum();
        stats.put("totalRevenue", totalRevenue);
        
        return stats;
    }
    
    /**
     * Get orders by status
     */
    public Page<Order> getOrdersByStatus(String status, Pageable pageable) {
        Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        return orderRepository.findByStatus(orderStatus, pageable);
    }

    /**
     * Get recent orders
     */
    public Page<Order> getRecentOrders(int days, Pageable pageable) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        LocalDateTime endDate = LocalDateTime.now();
        return orderRepository.findByDateRange(startDate, endDate, pageable);
    }
    
    /**
     * Cancel order
     */
    public Order cancelOrder(String id, String reason) {
        Order order = getOrderById(id);

        if (order.getStatus() == Order.OrderStatus.DELIVERED || order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancellationReason(reason);
        order.setCancelledAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);
        log.info("Order cancelled: {} - Reason: {}", order.getOrderNumber(), reason);

        return savedOrder;
    }
}