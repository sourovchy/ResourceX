/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8082";

const nextConfig = {
	transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
	images: {
		remotePatterns: [
			{
				protocol: "http",
				hostname: "localhost",
				port: "8082",
				pathname: "/api/files/**",
			},
			{
				protocol: "http",
				hostname: "localhost",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
			{
				protocol: "https",
				hostname: "example.com",
			},
		],
	},
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: `${backendUrl}/api/:path*`,
			},
			{
				source: "/ws-endpoint/:path*",
				destination: `${backendUrl}/ws-endpoint/:path*`,
			},
		];
	},
};

export default nextConfig;
