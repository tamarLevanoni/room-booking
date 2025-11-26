export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} RoomBooking. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
