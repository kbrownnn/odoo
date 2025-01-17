/** @odoo-module **/;

import {
    afterEach,
    beforeEach,
    createRootMessagingComponent,
    start,
} from '@mail/utils/test_utils';

QUnit.module('mail', {}, function () {
QUnit.module('components', {}, function () {
QUnit.module('composer_suggestion', {}, function () {
QUnit.module('composer_suggestion_command_tests.js', {
    beforeEach() {
        beforeEach(this);

        this.createComposerSuggestion = async props => {
            await createRootMessagingComponent(this, "ComposerSuggestion", {
                props,
                target: this.widget.el,
            });
        };

        this.start = async params => {
            const { env, widget } = await start(Object.assign({}, params, {
                data: this.data,
            }));
            this.env = env;
            this.widget = widget;
        };
    },
    afterEach() {
        afterEach(this);
    },
});

QUnit.test('command suggestion displayed', async function (assert) {
    assert.expect(1);

    this.data['mail.channel'].records.push({ id: 20 });
    await this.start();
    const thread = this.messaging.models['mail.thread'].findFromIdentifyingData({
        id: 20,
        model: 'mail.channel',
    });
    const command = this.messaging.models['mail.channel_command'].create({
        methodName: '',
        name: 'whois',
        help: "Displays who it is",
    });
    await this.createComposerSuggestion({
        composerLocalId: thread.composer.localId,
        isActive: true,
        modelName: 'mail.channel_command',
        recordLocalId: command.localId,
    });

    assert.containsOnce(
        document.body,
        `.o_ComposerSuggestion`,
        "Command suggestion should be present"
    );
});

QUnit.test('command suggestion correct data', async function (assert) {
    assert.expect(5);

    this.data['mail.channel'].records.push({ id: 20 });
    await this.start();
    const thread = this.messaging.models['mail.thread'].findFromIdentifyingData({
        id: 20,
        model: 'mail.channel',
    });
    const command = this.messaging.models['mail.channel_command'].create({
        methodName: '',
        name: 'whois',
        help: "Displays who it is",
    });
    await this.createComposerSuggestion({
        composerLocalId: thread.composer.localId,
        isActive: true,
        modelName: 'mail.channel_command',
        recordLocalId: command.localId,
    });

    assert.containsOnce(
        document.body,
        '.o_ComposerSuggestion',
        "Command suggestion should be present"
    );
    assert.containsOnce(
        document.body,
        '.o_ComposerSuggestion_part1',
        "Command name should be present"
    );
    assert.strictEqual(
        document.querySelector(`.o_ComposerSuggestion_part1`).textContent,
        "whois",
        "Command name should be displayed"
    );
    assert.containsOnce(
        document.body,
        '.o_ComposerSuggestion_part2',
        "Command help should be present"
    );
    assert.strictEqual(
        document.querySelector(`.o_ComposerSuggestion_part2`).textContent,
        "Displays who it is",
        "Command help should be displayed"
    );
});

QUnit.test('command suggestion active', async function (assert) {
    assert.expect(2);

    this.data['mail.channel'].records.push({ id: 20 });
    await this.start();
    const thread = this.messaging.models['mail.thread'].findFromIdentifyingData({
        id: 20,
        model: 'mail.channel',
    });
    const command = this.messaging.models['mail.channel_command'].create({
        methodName: '',
        name: 'whois',
        help: "Displays who it is",
    });
    await this.createComposerSuggestion({
        composerLocalId: thread.composer.localId,
        isActive: true,
        modelName: 'mail.channel_command',
        recordLocalId: command.localId,
    });

    assert.containsOnce(
        document.body,
        '.o_ComposerSuggestion',
        "Command suggestion should be displayed"
    );
    assert.hasClass(
        document.querySelector('.o_ComposerSuggestion'),
        'active',
        "should be active initially"
    );
});

});
});
});
