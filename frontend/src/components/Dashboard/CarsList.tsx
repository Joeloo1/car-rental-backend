import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import type { ApiError } from "../../types";
import { carService } from "../../services/car.service.ts";
import { Loader2, Trash2 } from "lucide-react";

interface CarsListProps {
  lenderId: string;
}

const CarsList: React.FC<CarsListProps> = ({ lenderId }) => {
  const queryClient = useQueryClient();

  const { data: cars, isLoading } = useQuery({
    queryKey: ["cars", "lender", lenderId],
    queryFn: () => carService.getByLender(lenderId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => carService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars", "lender", lenderId] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Car deleted successfully.");
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Failed to delete car.");
    },
  });

  if (isLoading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Loader2 className="spin" size={24} />
      </div>
    );

  if (!cars || cars.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--text-muted)",
        }}
      >
        You haven't listed any cars yet.
      </div>
    );
  }

  return (
    <table className="activity-table">
      <thead>
        <tr>
          <th>Car</th>
          <th>Location</th>
          <th>Price / Day</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {cars.map((car: any) => (
          <tr key={car.id}>
            <td>
              <div className="table-car-info">
                <img
                  src={
                    car.images?.[0]?.imageUrl ||
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=100"
                  }
                  alt="Car"
                />
                <span>{car.title}</span>
              </div>
            </td>
            <td>{car.locationCity}</td>
            <td>${car.pricePerDay}</td>
            <td>
              <span
                className={`badge-status ${car.availabilityStatus === "available" ? "success" : "warning"}`}
              >
                {car.availabilityStatus}
              </span>
            </td>
            <td>
              <button
                title="Delete Car"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--danger)",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to delete this car?")
                  )
                    deleteMutation.mutate(car.id);
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={18} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CarsList;
