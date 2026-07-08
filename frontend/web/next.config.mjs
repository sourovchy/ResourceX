/** @type {import('next').NextConfig} */
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
				destination: "http://localhost:8082/api/:path*",
			},
			{
				source: "/ws-endpoint/:path*",
				destination: "http://localhost:8082/ws-endpoint/:path*",
			},
		];
	},
};

export default nextConfig;
