/** @odoo-module **/

import { getMessagingComponent } from "@mail/utils/messaging_component";
import {
    afterEach,
    afterNextRender,
    beforeEach,
    start,
} from '@mail/utils/test_utils';

QUnit.module('im_livechat', {}, function () {
QUnit.module('components', {}, function () {
QUnit.module('composer', {}, function () {
QUnit.module('composer_tests.js', {
    beforeEach() {
        beforeEach(this);

        this.createComposerComponent = async (composer, otherProps) => {
            const ComposerComponent = getMessagingComponent("Composer");
            ComposerComponent.env = this.env;
            this.component = new ComposerComponent(null, Object.assign({
                composerLocalId: composer.localId,
            }, otherProps));
            delete ComposerComponent.env;
            await afterNextRender(() => this.component.mount(this.widget.el));
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

QUnit.test('livechat: no add attachment button', async function (assert) {
    // Attachments are not yet supported in livechat, especially from livechat
    // visitor PoV. This may likely change in the future with task-2029065.
    assert.expect(2);

    await this.start();
    const thread = this.messaging.models['mail.thread'].create({
        channel_type: 'livechat',
        id: 10,
        model: 'mail.channel',
    });
    await this.createComposerComponent(thread.composer);
    assert.containsOnce(document.body, '.o_Composer', "should have a composer");
    assert.containsNone(
        document.body,
        '.o_Composer_buttonAttachment',
        "composer linked to livechat should not have a 'Add attachment' button"
    );
});

});
});
});
