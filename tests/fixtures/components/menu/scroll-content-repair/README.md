# Anchored surface scroll-content regression

Use Google Chrome DevTools MCP exclusively. Open the Menu docs and invoke `reviewScrollContentRepair()` from `review.js` through MCP evaluation at 1100px or wider. It checks a short submenu trigger alongside a wider command, LTR/RTL, portaled and non-portaled menus, and viewport-edge collision flipping. It also checks long native scrollports with fades off/on. The fixture cleans up its created menus and restores no source files.

Separately use real hover and ArrowRight/ArrowLeft on the authored Menu example. Inspect Menubar, Navigation Menu and Popover content to confirm the shared wrapper retains child stretching and gap inheritance. Run Axe and inspect accessible submenu names/expanded state independently. Geometry from public setOpen calls is not a real-input test.
