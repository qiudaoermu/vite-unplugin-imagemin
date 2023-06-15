import * as vite from 'vite';
import * as _unplugin from 'unplugin';

interface PluginOptions {
    dirs?: string;
}
declare const unplugin: _unplugin.UnpluginInstance<PluginOptions, boolean>;
declare const _default: (options: PluginOptions) => vite.Plugin | vite.Plugin[];

export { PluginOptions, _default as default, unplugin };
