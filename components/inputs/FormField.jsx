import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const FormField = ({
  icon: IconComponent = false,
  lefticon: LeftIconComponent = false,
  value,
  otherStyles,
  placeholder,
  color,
  title,
  editable = true,
  error,
  titleStyle,
  handleChangeText,
  keyboardType,
  width,
  textInputBgStyles,
  textFocus,
  height,
  autoCapitalize,
  maxLength,
  textInputStyle,
  RightIconComponent,
  rightIconName,
  rightIconColor = "#c2c2c2",
  rightIconSize = 20,
  onRightIconPress,
  iconBrand: NameIcon,
  iconName,
  iconColor = "#c2c2c2",
  onLeftIconPress,
  size = 20,
  // New props for Home component compatibility
  onChangeText,
  onFocus,
  onBlur,
  password = false,
  ...otherProps
}) => {
  const [secureEntryState, setSecureEntryState] = useState(password);
  const toggleSecureEntry = () => setSecureEntryState(!secureEntryState);
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = (text) => {
    // Support both handleChangeText (existing) and onChangeText (new)
    if (handleChangeText) handleChangeText(text);
    if (onChangeText) onChangeText(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Support both textFocus (existing) and onFocus (new)
    if (textFocus) textFocus();
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  return (
    <View className={`gap-1 ${otherStyles}`}>
      {title && (
        <Text
          className={`text-base font-SpaceGrotesk-Semibold mb-1 text-gray-textSubtitle ${titleStyle}`}
        >
          {title}
        </Text>
      )}

      <View
        className={`h-[52] w-full border px-4 rounded-2xl items-center flex flex-row ${
          isFocused ? "border-primary" : "border-gray-borderDefault"
        } ${textInputBgStyles}`}
      >
        <View className={`flex-row items-center flex-1 w-full `}>
          {LeftIconComponent && (
            <View className="mr-2">
              <LeftIconComponent width={width} height={height} color={color} />
            </View>
          )}

          {NameIcon && (
            <TouchableOpacity
              onPress={onLeftIconPress}
              className="flex-shrink-0 items-center justify-center mr-2"
              disabled={!onLeftIconPress}
            >
              <NameIcon name={iconName} size={size} color={iconColor} />
            </TouchableOpacity>
          )}

          <TextInput
            className={`flex-1 text-base font-SpaceGrotesk-Regular text-gray-textTitle pr-3 ${textInputStyle}`}
            placeholder={placeholder}
            value={value}
            placeholderTextColor="#c2c2c2"
            keyboardType={keyboardType}
            returnKeyType="done"
            selectionColor="#605d55"
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={editable}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            secureTextEntry={password ? secureEntryState : false}
            {...otherProps}
          />

          {password && ( // Only show the eye icon for password fields
            <TouchableOpacity
              onPress={toggleSecureEntry}
              className="flex-shrink-0 items-center justify-center ml-2"
            >
              {secureEntryState ? (
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={20}
                  color="#00a859"
                />
              ) : (
                <MaterialCommunityIcons
                  name="eye-off-outline"
                  size={20}
                  color="#7b7b7b"
                />
              )}
            </TouchableOpacity>
          )}

          {IconComponent && (
            <IconComponent width={20} height={20} color={color} />
          )}
          {/* Optional Right Icon */}
          {!IconComponent && RightIconComponent && rightIconName && (
            <TouchableOpacity
              onPress={onRightIconPress}
              className="flex-shrink-0 items-center justify-center ml-2"
              disabled={!onRightIconPress}
            >
              <RightIconComponent
                name={rightIconName}
                size={rightIconSize}
                color={rightIconColor}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && (
        <Text className={`text-xs font-Raleway-Light text-error-textLink`}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default FormField;
