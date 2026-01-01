export default function Footer() {
    const navigationLeft = [
        { label: "Beranda", href: "#" },
        { label: "Fitur", href: "#" },
        { label: "Tracking Kesehatan", href: "#" },
        { label: "Resep & Nutrisi", href: "#" },
    ];

    const navigationRight = [
        { label: "Pengantaran Obat", href: "#" },
        { label: "Pengantaran Makanan", href: "#" },
        { label: "Tentang DocGo", href: "#" },
        { label: "Kebijakan Privasi", href: "#" },
    ];

    const socialLinks = [
        { label: "Facebook", href: "#" },
        { label: "Instagram", href: "#" },
        { label: "Twitter", href: "#" },
    ];

    const contactInfo = [
        "+62 812-3456-7890",
        "support@docgo.id",
        "info@docgo.id",
    ];

    return (
        <footer className="w-full bg-background text-foreground px-6 pt-8 md:px-16 lg:px-36">
            <div className="flex flex-col md:flex-row justify-between gap-10 border-b border-border pb-10">
                
                {/* Brand */}
                <div className="md:max-w-96">
                    <img src="/images/logo.png" className="h-40" alt="DocGo Logo" />
                    <p className="mt-6 text-sm">
                        DocGo adalah aplikasi manajemen kesehatan terpadu untuk membantu pengguna
                        memantau dan mengelola kondisi kesehatan secara berkelanjutan.
                    </p>

                    <div className="flex gap-2 mt-4">
                        <img
                            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/googlePlayBtnBlack.svg"
                            alt="Google Play"
                            className="h-10 border border-border rounded"
                        />
                        <img
                            src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/appDownload/appleStoreBtnBlack.svg"
                            alt="App Store"
                            className="h-10 border border-border rounded"
                        />
                    </div>
                </div>

                {/* Links */}
                <div className="flex-1 flex flex-col md:flex-row md:justify-end md:mt-20 gap-10 md:gap-30">
                    
                    {/* Navigation */}
                    <div className="md:mr-auto">
                        <h2 className="font-semibold mb-5">Navigation</h2>
                        <div className="grid grid-cols-2 gap-x-10">
                            <ul className="text-sm space-y-2">
                                {navigationLeft.map((item) => (
                                    <li key={item.label}>
                                        <a href={item.href} className="hover:text-accent">
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <ul className="text-sm space-y-2">
                                {navigationRight.map((item) => (
                                    <li key={item.label}>
                                        <a href={item.href} className="hover:text-accent">
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Social */}
                    <div>
                        <h2 className="font-semibold mb-5">Follow Us</h2>
                        <ul className="text-sm space-y-2">
                            {socialLinks.map((item) => (
                                <li key={item.label}>
                                    <a href={item.href} className="hover:text-accent">
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h2 className="font-semibold mb-5">Get in Touch</h2>
                        <ul className="text-sm space-y-2">
                            {contactInfo.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <p className="text-xs text-center py-6 text-muted-foreground">
                © 2025 DocGo. All rights reserved.
            </p>
        </footer>
    );
}
