import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { X, Loader2, Upload, Trash2 } from "@/lib/icons";
import type { ApiError } from "../../types/index";

import { carService } from "../../services/car.service.ts";
import { categoryService } from "../../services/category.service.ts";
import "./AddCarModal.css";

interface AddCarModalProps {
  onClose: () => void;
}

const AddCarModal: React.FC<AddCarModalProps> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    pricePerDay: "",
    locationCity: "",
    categoryId: "",
    description: "",
    fuelType: "Petrol",
    transmission: "Automatic",
    seats: 4,
    topSpeed: "",
    acceleration: "",
    enginePower: "",
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages((prev: File[]) => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev: string[]) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev: File[]) =>
      prev.filter((_, i: number) => i !== index),
    );
    setImagePreviews((prev: string[]) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      return newPreviews.filter((_, i: number) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      year: Number(formData.year),
      pricePerDay: Number(formData.pricePerDay),
      categoryId: Number(formData.categoryId),
      seats: Number(formData.seats),
      topSpeed: Number(formData.topSpeed) || undefined,
    };

    setIsUploading(true);
    try {
      // 1. Create the car
      const car = await carService.create(payload);

      // 2. Upload images if any
      if (selectedImages.length > 0) {
        const imageFormData = new FormData();
        selectedImages.forEach((image: File) => {
          imageFormData.append("images", image);
        });

        await carService.uploadImages(car.id, imageFormData);
      }

      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      onClose();
      toast.success("Car listed successfully with images!");
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(
        error.response?.data?.message ||
          "Failed to list car. Check your inputs.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass animate-slide-down">
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>Add New Car Listing</h2>
        <p className="modal-subtitle">List your vehicle to start earning.</p>

        <form onSubmit={handleSubmit} className="add-car-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Porsche 911 GT3"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Porsche"
              />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input
                type="text"
                name="model"
                required
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. 911"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                name="year"
                required
                value={formData.year}
                onChange={handleChange}
                min="1990"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div className="form-group">
              <label>Price Per Day ($)</label>
              <input
                type="number"
                name="pricePerDay"
                required
                value={formData.pricePerDay}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location (City)</label>
            <input
              type="text"
              name="locationCity"
              required
              value={formData.locationCity}
              onChange={handleChange}
              placeholder="e.g. Los Angeles"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fuel Type</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transmission</label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Seats</label>
              <input
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                min="1"
                max="10"
              />
            </div>
            <div className="form-group">
              <label>Top Speed (km/h)</label>
              <input
                type="number"
                name="topSpeed"
                value={formData.topSpeed}
                onChange={handleChange}
                placeholder="e.g. 320"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>0-100 km/h (sec)</label>
              <input
                type="text"
                name="acceleration"
                value={formData.acceleration}
                onChange={handleChange}
                placeholder="e.g. 3.2s"
              />
            </div>
            <div className="form-group">
              <label>Engine Power</label>
              <input
                type="text"
                name="enginePower"
                value={formData.enginePower}
                onChange={handleChange}
                placeholder="e.g. 550 HP"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your car features, condition, and rules..."
            ></textarea>
          </div>

          <div className="form-group">
            <label>Vehicle Images (Max 10)</label>
            <div className="image-uploader-container">
              <label className="image-upload-dropzone">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
                <Upload size={24} />
                <span>Click to upload photos</span>
              </label>

              <div className="image-previews-grid">
                {imagePreviews.map((url: string, i: number) => (
                  <div key={i} className="preview-card">
                    <img src={url} alt={`Preview ${i}`} />
                    <button
                      type="button"
                      className="remove-img-btn"
                      onClick={() => removeImage(i)}
                    >
                      <Trash2 size={14} />
                    </button>
                    {i === 0 && <span className="main-badge">Main</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-lg w-full"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="spin" size={18} /> Listing Car...
              </>
            ) : (
              "List Car"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCarModal;
