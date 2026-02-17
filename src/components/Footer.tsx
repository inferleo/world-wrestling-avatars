
export default function Footer() {
    return (
        <footer className="bg-black text-neutral-400 py-8 border-t border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm">
                    &copy; {new Date().getFullYear()} World Wrestling Avatars. All rights reserved.
                </div>
                <div className="flex space-x-6 text-sm">
                    <a href="#" className="hover:text-red-500 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-red-500 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-red-500 transition-colors">Contact</a>
                </div>
            </div>
        </footer>
    );
}
