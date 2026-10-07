USE complaint_portal;

-- Departments
INSERT INTO departments (department_name, description) VALUES
('Solid Waste Management', 'Handles garbage collection, dumping and cleanliness complaints'),
('Water Supply', 'Handles drinking water supply issues'),
('Drainage', 'Handles drainage and sewage related issues'),
('Roads', 'Handles road damage and pothole repairs'),
('Street Lighting', 'Handles street light repair and maintenance'),
('Garden / Parks', 'Handles public garden and tree related issues'),
('Building Department', 'Handles illegal construction / building safety issues'),
('Public Health', 'Handles stray animal and public health issues'),
('Encroachment / Traffic', 'Handles encroachment and traffic civic issues'),
('General Administration', 'Handles miscellaneous complaints');

-- Categories (mapped to a default department for smart suggestion)
INSERT INTO categories (category_name, icon, description, default_department_id, sla_days) VALUES
('Garbage', '🗑️', 'Uncollected garbage, littering, open dumping', 1, 3),
('Road / Pothole', '🛣️', 'Damaged roads, potholes, broken footpaths', 4, 10),
('Water Supply', '💧', 'No water supply, low pressure, contaminated water', 2, 2),
('Drainage', '🚰', 'Blocked drains, sewage overflow', 3, 3),
('Street Light', '💡', 'Non-functional or damaged street lights', 5, 5),
('Tree / Park', '🌳', 'Fallen trees, damaged park equipment', 6, 5),
('Building Issue', '🏢', 'Illegal construction, unsafe structures', 7, 15),
('Stray Animal', '🐕', 'Stray dogs/cattle causing nuisance or danger', 8, 5),
('Traffic / Civic Issue', '🚦', 'Encroachment, illegal parking, civic obstruction', 9, 7),
('Other', '📌', 'Any other municipal civic issue', 10, 7);

-- Demo users (password for both = "Demo@1234", stored as hash in the running prototype)
INSERT INTO users (name, mobile, email, password_hash, address, role) VALUES
('Rahul Sharma', '9876543210', 'rahul.demo@example.com', '$2a$hash$demo', 'Sector 12, Kharghar', 'citizen'),
('Priya Deshmukh', '9876500000', 'priya.demo@example.com', '$2a$hash$demo', 'FC Road, Pune', 'citizen'),
('Admin User', '9999999999', 'admin@example.com', '$2a$hash$demo', 'Municipal Office', 'admin');

-- Demo complaints
INSERT INTO complaints (complaint_id, user_id, category_id, title, description, address, area, landmark, pincode,
    status, department_id, assigned_to, expected_resolution_date, created_at) VALUES
('CMP-000101', 1, 1, 'Garbage not collected for 3 days',
 'Large amount of garbage has accumulated near the road and is causing a bad smell.',
 'Plot 45, Sector 12', 'Kharghar', 'Near Central Park', '410210',
 'In Progress', 1, 'Ward Sanitation Team B', DATE_ADD(CURDATE(), INTERVAL 1 DAY), NOW()),
('CMP-000102', 2, 2, 'Large pothole near residential area',
 'A large pothole has formed near the residential society entrance, risky for two-wheelers.',
 'Near Society Gate No. 2', 'FC Road', 'Opp. Bakery', '411004',
 'Resolved', 4, 'Road Maintenance Team A', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY));

INSERT INTO complaint_status_history (complaint_id, status, remarks, updated_by) VALUES
('CMP-000101', 'Registered', 'Complaint submitted by citizen', 'System'),
('CMP-000101', 'Verified', 'Complaint verified by ward office', 'Ward Officer'),
('CMP-000101', 'Department Assigned', 'Assigned to Solid Waste Management', 'System'),
('CMP-000101', 'In Progress', 'Cleanup team dispatched', 'Ward Sanitation Team B'),
('CMP-000102', 'Registered', 'Complaint submitted by citizen', 'System'),
('CMP-000102', 'Verified', 'Complaint verified', 'Ward Officer'),
('CMP-000102', 'Department Assigned', 'Assigned to Roads Department', 'System'),
('CMP-000102', 'In Progress', 'Repair work started', 'Road Maintenance Team A'),
('CMP-000102', 'Resolved', 'Pothole filled and levelled', 'Road Maintenance Team A');
