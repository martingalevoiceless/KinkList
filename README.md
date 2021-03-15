https://rawcdn.githack.com/martingalevoiceless/KinkList/master/index.html

Forked from MobButcher, preset customzied with vr lewding in mind. If you know who I am on discord or don't mind revealing yourself on github, suggestions are welcome. Upstream readme continues:

--------

# Kinklist Editor
This application allows you to create and share your personal preferences with others. Easily customizable, flexible, and useful.

## Entering preferences
You can enter your preferences using buttons near each item.
Pressing on a selection once again would deselect it.
Additionally, you can enter Edit mode and enter your preferences one at a time: use green button in the upper right corner.
You can use keyboard to navigate the menu: you can press number key (either on the top row or on a NumPad) to select your kink preference. They are labeled with a corresponding key.
Additionally, you can press `Up` or `Right` to skip to a next kink. `Down` and `Left` will bring you to the previous one.

## Resetting your progress
If you want to start from scratch, use red Reset button to clean all of your selections to default configuration.

## Presets
Presets allow you to customize your lists the way you like and have multiple different configurations ready to use. To start using them, hover over or tap on the Settings button in the upper right corner, then select `Presets` from the dropdown.
By default you have presets supplied at launch, but you can create your own.
- `Create` button will create a new preset with default configuration.
- `Duplicate` will duplicate currently selected preset (along with selections of kinks already present).
- `Rename` allows you to rename a preset you already have.
- `Delete` a preset if you have to.
- Don't forget to `Save` your changes. Or you can `Select` the current preset, closing the overlay and start editing it to your desire.

### Preset syntax
When creating a new preset, you have a somewhat intuitive way to edit its entries.
Each category must have a name, columns, and items. Categories must be separated with at least one blank line.

> If you see items enclosed in triangle or square brackets (like this: `<example>`), you have to replace them with the appropriate item. Do not include the brackets themselves.

- `#<Category name>`
- `(<Column name>[, <Another column name>]...)`
- `* <Item name>`

Example:
```
#Height
(Self, Others)
* Tall
* Average
* Short

```
Tips:

- Include spaces between `*` and `<Item name>`;
- Include spaces between commas and following column names;
- Don't include spaces between `#` and `<Category name>`;
- Separate each entry in a new line, without any extra lines between category elements.

## Saving and exporting your work
Using Generate button you can create an image of your kinklist you can share with others. If you click (or tap for mobile users) on the image, it will be downloaded to your device. You can also export the image to Imgur. It will automatically upload the image and give you the link you can share with your friends.
> **Warning:** Right now Export to Imgur uploads the image you are able to see on your page. If you made any changes in your kinklist, please Generate it again and confirm your selections have been updated before uploading your image to Imgur.

## Credit
Original [Kinklist](https://github.com/Goctionni/KinkList) project was made by Goctionni. This is a complete rewrite of his project, made from the ground up. All of the code was rewritten. Unfortunately, this also means that not all browsers may be supported. If the page doesn't render properly on your device, please visit [original project page](https://cdn.rawgit.com/Goctionni/KinkList/master/v1.0.2.html), update your browser, [file an Issue](https://github.com/MobButcher/KinkList/issues/new) or [create a new Pull request](https://github.com/MobButcher/KinkList/pulls).
