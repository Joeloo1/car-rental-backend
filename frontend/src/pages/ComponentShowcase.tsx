import { useState } from "react";
import { Car, Mail, Lock, Search, Heart } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import LoadingSkeleton, {
  CarCardSkeleton,
} from "../components/ui/LoadingSkeleton";
import toast from "react-hot-toast";

/**
 * Component Showcase Page
 *
 * This page demonstrates all the new UI components.
 * Use this as a reference for how to use each component.
 *
 * To view: Add route in App.tsx:
 * <Route path="/showcase" element={<ComponentShowcase />} />
 */
const ComponentShowcase = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState("");

  const selectOptions = [
    { value: "sedan", label: "Sedan" },
    { value: "suv", label: "SUV" },
    { value: "sports", label: "Sports Car" },
    { value: "luxury", label: "Luxury" },
  ];

  return (
    <div className="min-h-screen bg-dark-600 py-20">
      <div className="container-custom space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-responsive-xl font-display font-bold text-white">
            Component Showcase
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore all the production-ready UI components available in
            LuxeDrive
          </p>
        </div>

        {/* Buttons Section */}
        <section className="space-y-6">
          <div className="glass-strong p-6 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Buttons
            </h2>

            <div className="space-y-8">
              {/* Variants */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">
                  Variants
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Sizes</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              {/* With Icons */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">
                  With Icons
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Button leftIcon={<Car size={20} />}>Book Now</Button>
                  <Button rightIcon={<Search size={20} />}>Search</Button>
                  <Button variant="secondary" leftIcon={<Heart size={20} />}>
                    Favorites
                  </Button>
                </div>
              </div>

              {/* States */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">States</h3>
                <div className="flex flex-wrap gap-4">
                  <Button isLoading>Loading</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="space-y-6">
          <div className="glass-strong p-6 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Inputs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail size={18} />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                leftIcon={<Lock size={18} />}
                helperText="Must be at least 8 characters"
              />

              <Input
                label="With Error"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                error="This field is required"
              />

              <Input
                label="Disabled"
                type="text"
                placeholder="Disabled input"
                disabled
              />
            </div>
          </div>
        </section>

        {/* Select Section */}
        <section className="space-y-6">
          <div className="glass-strong p-6 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Select Dropdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <Select
                label="Car Type"
                options={selectOptions}
                placeholder="Select a car type"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              />

              <Select
                label="With Error"
                options={selectOptions}
                error="Please select an option"
              />
            </div>
          </div>
        </section>

        {/* Modal Section */}
        <section className="space-y-6">
          <div className="glass-strong p-6 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Modal
            </h2>

            <div className="flex flex-wrap gap-4">
              <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            </div>

            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Example Modal"
              size="md"
            >
              <div className="space-y-4">
                <p className="text-gray-300">
                  This is an example modal with smooth animations and
                  accessibility features.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      toast.success("Action confirmed!");
                      setIsModalOpen(false);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        </section>

        {/* Spinners Section */}
        <section className="space-y-6">
          <div className="glass-strong p-6 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Spinners
            </h2>

            <div className="flex flex-wrap items-center gap-8">
              <div className="space-y-2">
                <Spinner size="sm" />
                <p className="text-xs text-gray-400">Small</p>
              </div>
              <div className="space-y-2">
                <Spinner size="md" />
                <p className="text-xs text-gray-400">Medium</p>
              </div>
              <div className="space-y-2">
                <Spinner size="lg" />
                <p className="text-xs text-gray-400">Large</p>
              </div>
              <div className="space-y-2">
                <Spinner size="xl" />
                <p className="text-xs text-gray-400">Extra Large</p>
              </div>
            </div>
          </div>
        </section>

        {/* Toast Section */}
        <section className="space-y-6">
          <div className="glass-strong p-6 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Toast Notifications
            </h2>

            <div className="flex flex-wrap gap-4">
              <Button onClick={() => toast.success("Success message!")}>
                Success Toast
              </Button>
              <Button
                variant="danger"
                onClick={() => toast.error("Error message!")}
              >
                Error Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast.loading("Loading...")}
              >
                Loading Toast
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast("Custom message", {
                    icon: "👋",
                    duration: 3000,
                  })
                }
              >
                Custom Toast
              </Button>
            </div>
          </div>
        </section>

        {/* Loading Skeletons Section */}
        <section className="space-y-6">
          <div className="glass-strong p-6 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Loading Skeletons
            </h2>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">
                  Basic Variants
                </h3>
                <div className="space-y-3 max-w-md">
                  <LoadingSkeleton variant="text" />
                  <LoadingSkeleton variant="title" />
                  <LoadingSkeleton variant="button" />
                  <LoadingSkeleton variant="avatar" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">
                  Car Card Skeleton
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <CarCardSkeleton />
                  <CarCardSkeleton />
                  <CarCardSkeleton />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Utility Classes Section */}
        <section className="space-y-6">
          <div className="glass-strong p-6 rounded-2xl">
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Utility Classes
            </h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-300">
                  Glassmorphism
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass p-6 rounded-xl">
                    <p className="text-white">Glass effect</p>
                  </div>
                  <div className="glass-strong p-6 rounded-xl">
                    <p className="text-white">Strong glass effect</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-300">
                  Gradient Text
                </h3>
                <h2 className="text-4xl font-display font-bold gradient-text">
                  Premium Car Rental
                </h2>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-300">
                  Animations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="premium-card p-6">
                    <p className="text-white">Hover me!</p>
                  </div>
                  <div className="glass p-6 rounded-xl animate-fade-in">
                    <p className="text-white">Fade in</p>
                  </div>
                  <div className="glass p-6 rounded-xl animate-fade-in-up delay-200">
                    <p className="text-white">Fade in up</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-400">
            All components are production-ready and fully accessible
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcase;
