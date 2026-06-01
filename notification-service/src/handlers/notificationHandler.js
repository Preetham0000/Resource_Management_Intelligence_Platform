module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // 1. New task assigned
        socket.on('taskAssigned', (data) => {
            console.log('Event [taskAssigned]:', data);
            // Broadcast to all connected clients (or implement room-based targeting)
            io.emit('taskAssigned', data);
        });

        // 2. Task status updated
        socket.on('taskStatusUpdated', (data) => {
            console.log('Event [taskStatusUpdated]:', data);
            io.emit('taskStatusUpdated', data);
        });

        // 3. Delay risk prediction generated
        socket.on('predictionGenerated', (data) => {
            console.log('Event [predictionGenerated]:', data);
            io.emit('predictionGenerated', data);
        });

        // 4. Sprint deadline approaching
        socket.on('sprintDeadlineAlert', (data) => {
            console.log('Event [sprintDeadlineAlert]:', data);
            io.emit('sprintDeadlineAlert', data);
        });

        // 5. Manager feedback added
        socket.on('managerFeedbackAdded', (data) => {
            console.log('Event [managerFeedbackAdded]:', data);
            io.emit('managerFeedbackAdded', data);
        });

        // Handle client disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};