import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid"; 
import { Box, Typography, TextField, Button } from "@mui/material";
import { getTrainings, deleteTraining } from "../trainingApi";
import type { Training } from "../types";
import dayjs from "dayjs";

type TrainingWithCustomerName = Training & { customerName?: string };

export default function TrainingList() {
  const [trainings, setTrainings] = useState<TrainingWithCustomerName[]>([]);
  const [search, setSearch] = useState("");

  const fetchTrainings = async () => {
    try {
      const data = await getTrainings();
      const items: Training[] = data._embedded?.trainings ?? [];

      const enriched = await Promise.all(
        items.map(async (t) => {
          let customerName = "Unknown";
          const href = t._links?.customer?.href;
          if (href) {
            try {
              const res = await fetch(href);
              const json = await res.json();
              const first = json.firstname ?? json.firstName ?? json.customer?.firstname ?? "";
              const last = json.lastname ?? json.lastName ?? json.customer?.lastname ?? "";
              if (first || last) customerName = `${first} ${last}`;
            } catch (err) {
              console.error("Failed to fetch customer for training:", err);
            }
          }
          return { ...t, customerName };
        })
      );

      setTrainings(enriched);
    } catch (err) {
      console.error(err);
      setTrainings([]);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleDelete = (href: string | undefined) => {
    if (!href) {
      alert("Cannot delete training: missing resource link.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this training?")) {
      deleteTraining(href)
        .then(() => fetchTrainings())
        .catch((err) => {
          console.error("Delete failed:", err);
          alert("Failed to delete training");
        });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Date",
      width: 200,
      renderCell: (params) =>
        params.row.date ? dayjs(params.row.date).format("DD.MM.YYYY HH:mm") : "No date",
    },
    { field: "duration", headerName: "Duration (min)", width: 120 },
    { field: "activity", headerName: "Activity", width: 150 },
    {
      field: "customerName",
      headerName: "Customer",
      width: 200,
      renderCell: (params) => params.row.customerName ?? "",
    },
    {
      field: "delete",
      headerName: "",
      width: 85,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const href = params.row?._links?.self?.href ?? params.row?.id;
        return (
          <Button color="error" size="small" onClick={() => handleDelete(href)}>
            Delete
          </Button>
        );
      },
    },
  ];

  const filteredTrainings = trainings.filter((t) =>
    Object.values(t).some((val) => val && val.toString().toLowerCase().includes(search.toLowerCase()))
  );

  // CSV Export
  const downloadCSV = () => {
    if (filteredTrainings.length === 0) return;

    const fields = ["id", "date", "duration", "activity", "customerName"];

    const header = fields.join(";");
    const csvRows = filteredTrainings.map((t) => {
      const id = t._links?.self?.href?.split("/").pop() ?? "";
      const values = [
        id,
        t.date ? dayjs(t.date).format("YYYY-MM-DD HH:mm") : "",
        t.duration,
        t.activity,
        t.customerName,
      ];
      return values.map((v) => `"${v ?? ""}"`).join(";");
    });

    const csvString = [header, ...csvRows].join("\n");

    const blob = new Blob(["\ufeff" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "trainings.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ width: "100%", height: 500, margin: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Trainings
      </Typography>

      <TextField
        label="Search trainings..."
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* CSV Export Button */}
      <Button
        variant="contained"
        size="small"
        sx={{ ml: 2, mb: 1 }}
        onClick={downloadCSV}
      >
        Download as CSV
      </Button>

      <DataGrid
        rows={filteredTrainings}
        columns={columns}
        getRowId={(row) => row._links?.self?.href ?? `${row.activity}-${Math.random()}`}
        autoPageSize
      />
    </Box>
  );
}
