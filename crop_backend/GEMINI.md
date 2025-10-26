Part 1: The Overall Backend Architecture (The Blueprint)
This architecture is designed as a decoupled, asynchronous data processing factory. The core principle is that no single component's failure or slowdown can bring down the entire system.

Here are the 9 key components and their roles:

Nginx (The Front Gate & Switchboard)

Purpose: The only service exposed to the internet. It handles all incoming traffic, manages SSL certificates (HTTPS), provides security against simple attacks (like rate limiting), and routes requests to the correct internal service.

Example: api.cropic.gov.in/ingest goes to the Ingestion API, while api.cropic.gov.in/dashboard goes to the Dashboard API.

Ingestion API (The Loading Dock)

Purpose: A high-speed, stateless Rust web server. Its only job is to accept new submissions (images/videos) from farmers and officials.

Critical Logic:

Validates the user's authentication token (JWT).

Streams the file directly to MinIO (our warehouse).

Writes the metadata (like user ID, lat/lon, submission type) to the PostgreSQL database.

Publishes a single, simple "new job" message to RabbitMQ.

Returns a 202 Accepted response to the app immediately.

It does NOT do any processing. It's designed to be incredibly fast and never get blocked.

PostgreSQL + PostGIS (The Central Ledger)

Purpose: Our single source of truth for all metadata. It stores everything except the actual files.

Key Tables:

users: Stores farmer/official details, hashed passwords, and their verification status.

submissions: The main log for every upload, tracking its status (e.g., RECEIVED, PROCESSING, COMPLETED, FAILED).

submission_assets: Links a submission to its files (e.g., sub-123 is linked to .../video.mp4 and .../frame-01.jpg, etc.).

analysis_results: Stores the JSON output from the AI model for each analyzed frame.

fused_reports: The final, "golden record" that combines all data for the dashboard.

MinIO (The Warehouse)

Purpose: A high-performance, S3-compatible object storage. It stores all the large, binary files.

Key Buckets: raw-uploads, processed-assets, verification-docs.

Relationship: The database only stores the path to the file (e.g., processed-assets/sub-123/frame-01.jpg).

RabbitMQ (The Conveyor Belt)

Purpose: The asynchronous message bus that connects our services. This is what decouples them.

Key Queues (The "Work Trays"):

new_submission_queue: The Ingestion API drops new jobs here.

ml_analysis_queue: The Pre-processor drops frame-by-frame jobs here.

data_fusion_queue: The ML Orchestrator drops a "job done" message here.

Pre-processing Worker (The "Video Splitter" / "Scatter" Logic)

Purpose: A background Rust service. It listens to new_submission_queue.

Logic: When it gets a "new video" job, it:

Downloads the raw video from MinIO.

Uses ffmpeg to extract 10 keyframes and create a standard web-playable video.

Uploads all 11 new files back to MinIO.

Updates the database tables with the new file paths.

Publishes 10 new, separate jobs (one for each frame) to the ml_analysis_queue.

ML Service (The "AI Brain")

Purpose: A separate Python/FastAPI server. Its only job is to host the AI model and expose an endpoint (e.g., /analyze) that accepts an image path and returns a JSON of analysis results.

ML Orchestrator Worker (The "AI Task-master")

Purpose: A background Rust service that listens to ml_analysis_queue.

Logic: For each frame job, it:

Calls the Python ML Service's /analyze endpoint.

Saves the resulting JSON to the analysis_results table.

Gather Logic: It then checks: "Are all frames for this submission now analyzed?" If yes, it publishes one "all done" job to the data_fusion_queue.

Data Fusion Worker (The "Report Writer")

Purpose: A background Rust service that listens to data_fusion_queue.

Logic: When a submission is "all done," it:

Gathers all 10 analysis results from the database.

Aggregates them (e.g., calculates average damage).

Calls external APIs (Weather, Satellite) for more context.

Writes all this data into the final fused_reports table.

Updates the main submission status to COMPLETED.

Dashboard API (The "Control Room View")

Purpose: A separate, read-only Rust API for the officials' web dashboard.

Logic: Provides fast, pre-calculated data by reading only from the fused_reports and users tables.
