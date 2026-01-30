import clsx from "clsx";
import { Text, TouchableOpacity, View } from "react-native";

const CustomButton = ({
  additionalStyles,
  handlePress,
  title,
  containerStyles,
  textStyles,
  disabled,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      className={clsx(
        "min-h-[40px] justify-center items-center rounded-2xl",
        containerStyles,
        disabled && "bg-primary-200"
      )}
    >
      <View
        className={clsx(
          "flex-row gap-x-2 items-center justify-center",
          additionalStyles
        )}
      >
        <Text className={clsx("font-SpaceGrotesk-Bold text-lg", textStyles)}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;
