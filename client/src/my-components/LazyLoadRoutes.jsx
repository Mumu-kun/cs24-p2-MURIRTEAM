import { Suspense, lazy } from "react";

const LazyLoadRoutes = (componentPath) => {
	componentPath = componentPath.replace("@", "..");
	const LazyElement = lazy(() => import(/* @vite-ignore */ componentPath));

	// Wrapping around the suspense component is mandatory
	return (
		<Suspense fallback="Loading...">
			<LazyElement />
		</Suspense>
	);
};

export default LazyLoadRoutes;
