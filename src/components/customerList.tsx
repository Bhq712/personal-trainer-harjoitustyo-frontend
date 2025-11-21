import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Box, Typography, TextField, Button, Toolbar } from "@mui/material";
import { getCustomers, deleteCustomer } from "../customerApi";
import type { Customer } from "../types";
import AddTraining from "./AddTraining";
import EditCustomer from "./EditCustomer";
import AddCustomer from "./AddCustomer";

type CustomerListProps = {
  fetchTrainings: () => void;
};

export default function CustomerList({ fetchTrainings }: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");

  const fetchCustomers = () => {
    getCustomers()
      .then((data) => setCustomers(data._embedded?.customers ?? []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = (url: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer(url).then(fetchCustomers).catch(console.error);
    }
  };

  const columns: GridColDef[] = [
    { field: "firstname", headerName: "First name", width: 150 },
    { field: "lastname", headerName: "Last name", width: 150 },
    { field: "streetaddress", headerName: "Address", width: 150 },
    { field: "postcode", headerName: "Postcode", width: 90 },
    { field: "city", headerName: "City", width: 120 },
    { field: "email", headerName: "Email", width: 150 },
    { field: "phone", headerName: "Phone", width: 125 },

    {
      field: "addtraining",
      headerName: "",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <AddTraining customers={[params.row]} fetchTrainings={fetchTrainings} />
      ),
    },

    {
      headerName: "",
      width: 85,
      sortable: false,
      filterable: false,
      field: "_links.customer.href",
      renderCell: (params) => (
        <EditCustomer fetchCustomers={fetchCustomers} customerRow={params.row} />
      ),
    },
    {
      field: "_links.self.href",
      headerName: "",
      width: 85,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          color="error"
          size="small"
          onClick={() => handleDelete(params.id as string)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const filteredCustomers = customers.filter((c) =>
    Object.values(c).some((val) =>
      val?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  // CSV EXPORT
 const downloadCSV = () => {
  if (filteredCustomers.length === 0) return;

  const fields = [
    "id",
    "firstname",
    "lastname",
    "streetaddress",
    "postcode",
    "city",
    "email",
    "phone"
  ];

  const header = fields.join(";");
  const csvRows = filteredCustomers.map(customer => {
    const id = customer._links.self.href.split("/").pop(); // ottaa id numeron URL:sta

    const values = [
      id,
      customer.firstname,
      customer.lastname,
      customer.streetaddress,
      customer.postcode,
      customer.city,
      customer.email,
      customer.phone
    ];

    return values.map(v => `"${v ?? ""}"`).join(";");
  });

  const csvString = [header, ...csvRows].join("\n");

  const blob = new Blob(["\ufeff" + csvString], {
    type: "text/csv;charset=utf-8;"
  });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "customers.csv";
  link.click();
  window.URL.revokeObjectURL(url);
};


  return (
    <>
    <Toolbar />
    <Box sx={{ width: "110%", margin: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Customers
      </Typography>

      <TextField
        label="Search customers..."
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <br />

      <AddCustomer fetchCustomers={fetchCustomers} />

      {/* CSV Export Button */}
      <Button
        variant="contained"
        size="small"
        sx={{ ml: 2, mb: 1 }}
        onClick={downloadCSV}
      >
        Download as CSV
      </Button>

      <div style={{ width: "100%", height: 500 }}>
        <DataGrid
          rows={filteredCustomers}
          columns={columns}
          getRowId={(row) => row._links.self.href}
          autoPageSize
          rowSelection={false}
        />
      </div>
    </Box>
    </>
  );
}
