---
created_at: 2026-06-06T17:06:13-04:00
modified_at: 2026-06-10T15:05:15-04:00
---
When modding, it can be useful to trigger events intentionally. One option is to use the [Event Tester](https://www.nexusmods.com/stardewvalley/mods/19458) mod, another is to use the built-in `debug ebi` command

>[!info] Execute commands in SMAPI window
>When launching the game, a terminal window opens wherein SMAPI is running (which in turn runs the game with mods). That's where you can enter the commands. If you're in fullscreen you may need to press the windows key and then tab. Alternatively you can change to windowed mode while debugging.

## Event Tester

Event Tester is a mod that provides many commands to test events, especially including the playing of events. One such command is `sinz.eventbyid`.  Assuming you've installed Event Tester, you would enter this followed by the event id.

Note by default this rapidly plays the event and automatically responds to any questions/dialog prompts. This is useful since you'll likely need to play it multiple times and at a certain depth to get at what you want.

## debug ebi

This built in debug command plays the event just like it had actually been triggered. Unlike `sinz.eventbyid`, the event plays at a realistic pace and you are the one who answers the question. Enter `debug ebi` in the console window, followed by the event id, and then hit enter.


#stardew-valley/modding 