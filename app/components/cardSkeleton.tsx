import styles from "./styles.module.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

const CardSkeleton = ({
  width = "100%",
  height = "40px",
  borderRadius = "10px",
  className,
}: SkeletonProps) => {
  return (
    <div
      className={styles.Skeleton_Loading}
      style={{
        width,
        height,
        borderRadius,
        background:
          "linear-gradient(90deg, rgb(227,227,227) 25%, #ededed 37%, rgb(227,227,227) 63%)",
        backgroundSize: "400% 100%",
        animation: `${styles.Skeleton_Loading} 1.4s ease infinite`,
      }}
    />
  );
};

export default CardSkeleton;
