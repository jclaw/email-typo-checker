# Email typo checker

The email typo checker is a tool to identify email typos and suggest corrections. It is currently in use on [Bandcamp](https://www.bandcamp.com).
* Catches typos in both the "domain section" (i.e. after the "@" symbol) and in the "personal section" (before the "@" symbol, based on a user's first and last name). 
* Works with names containing díäçrìtįčāl mārkś

Adapted from https://jsfiddle.net/davidg707/835bxzas. Here's an article that demo https://hackernoon.com/how-to-reduce-incorrect-email-addresses-df3b70cb15a9

This project is an effort to reduce typos and therefore the amount of typo-related support cases at Bandcamp. This is an alternative to adding a confirmation field to a form. Although there’s not much public data about the success of confirm email fields, some large amount of people copy and paste their emails between fields, and adding an unnecessary field to a form is not ideal. Instead of assuming that the user will screw up their email (which is what a confirm email field implies), the typo checker allows you to only prompt them if you notice something strange. In general, emails will often contain either/both the user's first and/or last names, and domain section typos are easy to check, so there is potential for effective typo checking.

**Unfortunately, the typo checker isn't performing so well**. After testing on a lot of real users, the it incorrectly flags emails 70% of the time. Most of those are in the personal section (83% ignore rate) vs the domain section (9.7% ignore rate). It was a valuable learning experience pursuing this creative solution rather than just adding a form field, and it might be more successful in different circumstances on different datasets.

Room for improvement:
* Using an English dictionary to identify more typos in the personal section
* ...

Other notes:
* From a UX perspective, corrections to personal typos work best if the user’s name is in-view when you propose the email correction; it could be the user’s name that has the typo.



## Description

Most emails these days use common domain names like gmail, yahoo, etc., and those are easy to check for. But we can also check the personal section. To do so, you need the user's first and last name.

Some words on the way it works! Most email typos are off by one character, and I am leveraging that fact. To check if a chunk of letters are similar to a name, for example, I check 4 cases. Using the name "jackson", the following strings would fall into each of these cases:
1) extra letter: jackshon
2) wrong letter: jacison
3) missing letter: jakson
4) switched letters: jakcson

For the personal section, I start with the first name, and grab chunks (of size name+1) from the personal section string looking for something that is similar to it. For a string like "clawmanjackshon94", I would take the following chunks:
```
clawmanj
lawmanja
awmanjac
...
jackshon
 ```
...at which point I would identify that it matches the first case, which is jackson with an extra letter somewhere. I then repeat the search using the last name.

For the domain section, I just check the first and last snippets that are delimited by periods, aka `@xxxxx.<not checked>.<nor this>.xxx`. For the domain extensions, I’m really only checking if there are numbers in that section or if the user put in .con, since that is a common typo that’s easy to gloss over.

Something special about the return value from `check_email_typos(email, firstname, lastname)`: it contains an array of snippets of the email, some corrected and some not. This format allows the corrected parts of the email to be highlighted, e.g. jacksonclawson@**gamil**.com.

The system has a few special features:
* It converts diacritical marks to their latin-character counterparts before checking for typos, e.g. `ö -> o`. I grabbed a mapping of these characters online and tweaked it based on some real data. For example, some people use o instead of ö, but some people do oe. The checker supports multiple mappings like this.
* It ignores hardcoded common nicknames where the part of the name might look like a misspelling of the nickname. For example, if your name is Joe in the firstname field, but your email is joseph@gmail.com, “jos” would be flagged as a misspelling of “joe” without hardcoding an exception. I added some nicknames as they came up if I decided they are common enough. I only have a few.

Conclusions: 
* a very small amount of people actually make typos (around 0.5% in the context I was working in)
* people have weird emails
* it’s fun to test on real-world data!
