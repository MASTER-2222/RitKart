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
            return orderRepository.findByStatus(status, pageable);
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
        
        order.setStatus(status);
        if (trackingNumber != null && !trackingNumber.isEmpty()) {
            order.setTrackingNumber(trackingNumber);
        }
        order.setUpdatedAt(LocalDateTime.now());
        
        // Update status history
        if (order.getStatusHistory() != null) {
            order.getStatusHistory().put(status, LocalDateTime.now());
        } else {
            Map<String, LocalDateTime> statusHistory = new HashMap<>();
            statusHistory.put(status, LocalDateTime.now());
            order.setStatusHistory(statusHistory);
        }
        
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
        stats.put("pendingOrders", orderRepository.countByStatus("PENDING"));
        stats.put("processingOrders", orderRepository.countByStatus("PROCESSING"));
        stats.put("shippedOrders", orderRepository.countByStatus("SHIPPED"));
        stats.put("deliveredOrders", orderRepository.countByStatus("DELIVERED"));
        stats.put("cancelledOrders", orderRepository.countByStatus("CANCELLED"));
        
        // Recent orders (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long recentOrders = orderRepository.countByCreatedAtAfter(thirtyDaysAgo);
        stats.put("recentOrders", recentOrders);
        
        // Total revenue (sum of all delivered orders)
        Double totalRevenue = orderRepository.getTotalRevenue();
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        
        return stats;
    }
    
    /**
     * Get orders by status
     */
    public Page<Order> getOrdersByStatus(String status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable);
    }
    
    /**
     * Get recent orders
     */
    public Page<Order> getRecentOrders(int days, Pageable pageable) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return orderRepository.findByCreatedAtAfter(startDate, pageable);
    }
    
    /**
     * Cancel order
     */
    public Order cancelOrder(String id, String reason) {
        Order order = getOrderById(id);
        
        if ("DELIVERED".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }
        
        order.setStatus("CANCELLED");
        order.setCancellationReason(reason);
        order.setUpdatedAt(LocalDateTime.now());
        
        // Update status history
        if (order.getStatusHistory() != null) {
            order.getStatusHistory().put("CANCELLED", LocalDateTime.now());
        } else {
            Map<String, LocalDateTime> statusHistory = new HashMap<>();
            statusHistory.put("CANCELLED", LocalDateTime.now());
            order.setStatusHistory(statusHistory);
        }
        
        Order savedOrder = orderRepository.save(order);
        log.info("Order cancelled: {} - Reason: {}", order.getOrderNumber(), reason);
        
        return savedOrder;
    }
}
