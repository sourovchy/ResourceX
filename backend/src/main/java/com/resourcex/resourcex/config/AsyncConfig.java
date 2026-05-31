package com.resourcex.resourcex.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.ThreadPoolExecutor;

/**
 * Dedicated executor for {@code @Async} work (e.g. audit logging).
 *
 * <p>The WebSocket/STOMP support registers its own channel {@code TaskExecutor}
 * beans (clientInbound/clientOutbound/brokerChannel), which causes Spring Boot to
 * skip its auto-configured {@code applicationTaskExecutor}. Without a bean named
 * {@code taskExecutor}, Spring's async infrastructure can't choose a default
 * executor and logs:
 * "More than one TaskExecutor bean found within the context, and none is named
 * 'taskExecutor'".
 *
 * <p>Defining this pooled executor named {@code taskExecutor} resolves the
 * ambiguity and keeps async tasks off the messaging channels.
 */
@Configuration
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("rx-async-");
        // Never silently drop audit/async work: run on the caller's thread if saturated.
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(20);
        executor.initialize();
        return executor;
    }
}
