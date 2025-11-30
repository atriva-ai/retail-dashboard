"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Camera } from "@/types";

export default function CameraStatusHeader() {
  const [cameraCount, setCameraCount] = useState(0);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const response = await apiClient.get<Camera[]>('/api/v1/cameras/')
        setCameraCount(response?.length ?? 0)
      } catch (err) {
        console.error("CameraStatusHeader: Error fetching cameras:", err)
        setCameraCount(0)
      }
    }

    fetchCameras()
  }, []);

  return <span>{cameraCount} total cameras across all zones</span>;
} 