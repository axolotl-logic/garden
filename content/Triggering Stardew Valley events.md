When modding, it can be useful to trigger events intentionally. One option is to use the [Event Tester](https://www.nexusmods.com/stardewvalley/mods/19458) mod, another is to use the built-in `debug ebi` command

>[!info] Execute commands in SMAPI window
>When launching the game, a terminal window opens wherein SMAPI is running (which in turn runs the game with mods). That's where you can enter the commands. If you're in fullscreen you may need to press the windows key and then tab. Alternatively you can change to windowed mode while debugging.

## Event Tester

Assuming you've installed Event Tester, the command to fire an event is `sinz.eventbyid` followed by the event id.

Note by default this rapidly plays the event and auto-answers. This is useful since you'll likely need to play it multiple times and at a certain depth to get at what you want.

## debug ebi

This built in debug command plays the event just like it had actually been triggered, including the same pace and allowance for you to answer questions. Enter `debug ebi` in the console window, followed by the event id, and then hit enter.


#stardew-valley/modding 