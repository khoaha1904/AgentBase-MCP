# 04.03 — Cloud Provider Profiles

> Trạng thái: AWS Profile v2 implemented; provider khác deferred.

AWS Profile normalize EC2/VM, Lambda, SQS, SNS, EventBridge, S3, RDS và DynamoDB
thành technology metadata. Lambda có independent runtime evidence có thể map
exact tới Function. Các resource khác mặc định embedded và không tự chọn
Server/Queue/Table/Bucket schema.

Profile là deterministic versioned data contract, không login cloud, giữ
credential, gọi provider CLI hay biến official docs thành repository evidence.
Azure/GCP cần profile và conformance riêng nhưng dùng cùng catalog roles.
