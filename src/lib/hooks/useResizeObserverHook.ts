import React, { RefObject, useCallback, useEffect, useState } from "react";

const useResizeObserverHook = (ref: RefObject<Element>): { width: number } => {
	const [width, setWidth] = useState(0);

	const onResize = useCallback((entries: ResizeObserverEntry[]) => {
		for (const entry of entries) {
			setWidth(entry.contentRect.width);
		}
	}, []);

	useEffect(() => {
		const resizeObserver = new ResizeObserver((entries) => onResize(entries));

		if (!ref.current) return;

		resizeObserver.observe(ref.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, [onResize, ref.current]);

	return { width };
};

export default useResizeObserverHook;
