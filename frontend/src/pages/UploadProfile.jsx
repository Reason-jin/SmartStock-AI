import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { uploadService } from "../services/uploadService"; // API 호출 함수
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function UploadProfile() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenant_id") || 1;

  const [uploadJob, setUploadJob] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // API에서 upload_job 정보 가져오기
        const res = await uploadService.getUploadProfile(id, tenantId);
        setUploadJob(res.upload_job);

        // profile_data 문자열(JSON) 파싱
        if (res.upload_job?.profile_data) {
          const parsedProfile = JSON.parse(res.upload_job.profile_data);
          setProfile(parsedProfile);
        }
      } catch (err) {
        console.error("업로드 상세 조회 실패:", err);
      }
    }
    fetchData();
  }, [id, tenantId]);

  if (!uploadJob) return <p className="p-4">불러오는 중...</p>;

  const columns = profile?.columns || [];
  const rows = profile?.head || [];

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{uploadJob.original_filename}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            상태:{" "}
            <Badge
              variant={
                uploadJob.status === "completed"
                  ? "secondary"
                  : uploadJob.status === "failed"
                  ? "destructive"
                  : "default"
              }
            >
              {uploadJob.status}
            </Badge>
          </p>
          <p>파일 크기: {(uploadJob.file_size / 1024 / 1024).toFixed(2)} MB</p>
          <p>행: {uploadJob.total_rows}, 열: {uploadJob.total_columns}</p>

          <h4 className="mt-4 font-semibold">샘플 데이터:</h4>
          {columns.length > 0 && rows.length > 0 ? (
            <div className="overflow-auto max-h-[500px] border rounded">
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    {columns.map((col, idx) => (
                      <th key={idx} className="border px-4 py-2 text-left">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b hover:bg-muted/20 transition"
                    >
                      {columns.map((col, cidx) => (
                        <td key={cidx} className="border px-4 py-2">
                          {row[col] ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground">샘플 데이터가 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}